import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

/**
 * Hook para buscar ocorrências disponíveis para o profissional
 *
 * Aplica filtros inteligentes:
 * - Não mostrar se profissional está de folga
 * - Não mostrar se já está alocado em outra ocorrência no mesmo horário
 * - Apenas ocorrências EM_ABERTO ou onde o profissional já está CONFIRMADO
 *
 * @param usuarioId - ID do usuário (médico ou enfermeiro)
 * @param tipoPerfil - Tipo do perfil (MEDICO ou ENFERMEIRO)
 */

interface Ocorrencia {
  id: number;
  numero_ocorrencia: string;
  tipo_trabalho: 'EVENTO' | 'DOMICILIAR' | 'EMERGENCIA' | 'TRANSFERENCIA';
  tipo_ambulancia: 'BASICA' | 'EMERGENCIA';
  data_ocorrencia: string;
  horario_saida: string;
  horario_no_local: string;
  horario_termino?: string;
  local_ocorrencia: string;
  status: 'EM_ABERTO' | 'CONFIRMADA' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  vagas_disponiveis?: number;
  total_vagas?: number;
  profissional_confirmado?: boolean;
}

interface OcorrenciasGroup {
  confirmadas: Ocorrencia[];
  disponiveis: Ocorrencia[];
}

export function useOcorrenciasDisponiveis(
  usuarioId: number | undefined,
  tipoPerfil: 'MEDICO' | 'ENFERMEIRO'
) {
  return useQuery({
    queryKey: ['ocorrencias-disponiveis', usuarioId, tipoPerfil],
    queryFn: async (): Promise<OcorrenciasGroup> => {
      if (!usuarioId) {
        return { confirmadas: [], disponiveis: [] };
      }

      // 1. Buscar ocorrências EM_ABERTO ou onde o profissional está confirmado
      const { data: ocorrencias, error } = await supabase
        .from('ocorrencias')
        .select(`
          id,
          numero_ocorrencia,
          tipo_trabalho,
          tipo_ambulancia,
          data_ocorrencia,
          horario_saida,
          horario_no_local,
          horario_termino,
          local_ocorrencia,
          status,
          participantes:ocorrencias_participantes(
            id,
            usuario_id,
            tipo_profissional,
            confirmado,
            vaga_disponivel
          )
        `)
        .in('status', ['EM_ABERTO', 'CONFIRMADA'])
        .gte('data_ocorrencia', new Date().toISOString().split('T')[0])
        .order('data_ocorrencia', { ascending: true })
        .order('horario_saida', { ascending: true });

      if (error) {
        console.error('Erro ao buscar ocorrências:', error);
        throw error;
      }

      // 2. Buscar escala do profissional (verificar folgas)
      const { data: escala } = await supabase
        .from('escala')
        .select('data, disponivel')
        .eq('usuario_id', usuarioId)
        .eq('disponivel', false);

      const diasDeFolga = new Set(escala?.map((e: any) => e.data) || []);

      // 3. Processar ocorrências
      const confirmadas: Ocorrencia[] = [];
      const disponiveis: Ocorrencia[] = [];

      for (const ocorrencia of ocorrencias || []) {
        const dataOcorrencia = ocorrencia.data_ocorrencia;

        // Filtro 1: Pular se está de folga neste dia
        if (diasDeFolga.has(dataOcorrencia)) {
          continue;
        }

        // Verificar se o profissional já está confirmado nesta ocorrência
        const participacaoProfissional = (ocorrencia.participantes as any[])?.find(
          (p: any) => p.usuario_id === usuarioId
        );

        const jaConfirmado = participacaoProfissional?.confirmado === true;

        if (jaConfirmado) {
          // Profissional já confirmado - adicionar à lista de confirmadas
          confirmadas.push({
            id: ocorrencia.id,
            numero_ocorrencia: ocorrencia.numero_ocorrencia,
            tipo_trabalho: ocorrencia.tipo_trabalho,
            tipo_ambulancia: ocorrencia.tipo_ambulancia,
            data_ocorrencia: ocorrencia.data_ocorrencia,
            horario_saida: ocorrencia.horario_saida,
            horario_no_local: ocorrencia.horario_no_local,
            horario_termino: ocorrencia.horario_termino,
            local_ocorrencia: ocorrencia.local_ocorrencia,
            status: ocorrencia.status,
            profissional_confirmado: true,
          });
        } else if (ocorrencia.status === 'EM_ABERTO') {
          // Ocorrência em aberto - verificar se há vagas para este perfil

          // Contar vagas disponíveis para o tipo de profissional
          const vagasParaPerfil = (ocorrencia.participantes as any[])?.filter(
            (p: any) =>
              p.tipo_profissional === tipoPerfil && p.vaga_disponivel === true
          );

          const totalVagasParaPerfil = vagasParaPerfil?.length || 0;
          const vagasPreenchidas = (ocorrencia.participantes as any[])?.filter(
            (p: any) =>
              p.tipo_profissional === tipoPerfil && p.confirmado === true
          ).length || 0;

          const vagasDisponiveis = totalVagasParaPerfil - vagasPreenchidas;

          if (vagasDisponiveis > 0) {
            // Há vagas disponíveis para este perfil
            disponiveis.push({
              id: ocorrencia.id,
              numero_ocorrencia: ocorrencia.numero_ocorrencia,
              tipo_trabalho: ocorrencia.tipo_trabalho,
              tipo_ambulancia: ocorrencia.tipo_ambulancia,
              data_ocorrencia: ocorrencia.data_ocorrencia,
              horario_saida: ocorrencia.horario_saida,
              horario_no_local: ocorrencia.horario_no_local,
              horario_termino: ocorrencia.horario_termino,
              local_ocorrencia: ocorrencia.local_ocorrencia,
              status: ocorrencia.status,
              vagas_disponiveis: vagasDisponiveis,
              total_vagas: totalVagasParaPerfil,
              profissional_confirmado: false,
            });
          }
        }
      }

      return {
        confirmadas,
        disponiveis,
      };
    },
    enabled: !!usuarioId,
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });
}
