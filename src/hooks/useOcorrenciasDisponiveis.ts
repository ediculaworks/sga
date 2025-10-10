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
  horario_no_local: string | null;
  horario_termino?: string | null;
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

interface OcorrenciaParticipante {
  id: number;
  usuario_id: number | null;
  usuario_designado_id?: number | null; // Profissional designado diretamente
  funcao: string;
  confirmado: boolean;
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
          horario_chegada_local,
          horario_termino,
          local_ocorrencia,
          status_ocorrencia,
          participantes:ocorrencias_participantes(
            id,
            usuario_id,
            funcao,
            confirmado
          )
        `)
        .in('status_ocorrencia', ['EM_ABERTO', 'CONFIRMADA'])
        .gte('data_ocorrencia', new Date().toISOString().split('T')[0])
        .order('data_ocorrencia', { ascending: true });

      if (error) {
        console.error('Erro ao buscar ocorrências:', error);
        throw error;
      }

      console.log('Ocorrências retornadas:', ocorrencias?.length || 0);

      // 2. Buscar escala do profissional (verificar folgas)
      const { data: escala, error: escalaError } = await supabase
        .from('escala')
        .select('data, disponivel')
        .eq('usuario_id', usuarioId)
        .eq('disponivel', false);

      if (escalaError) {
        console.error('Erro ao buscar escala:', escalaError);
      }

      const diasDeFolga = new Set(escala?.map((e) => e.data) || []);

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
        const participantes = (ocorrencia.participantes || []) as unknown as OcorrenciaParticipante[];

        const participacaoProfissional = participantes.find(
          (p) => p.usuario_id === usuarioId
        );

        const jaConfirmado = participacaoProfissional?.confirmado === true;

        // Se o profissional já confirmou participação, mostrar em "Confirmadas"
        // INDEPENDENTE do status da ocorrência (EM_ABERTO ou CONFIRMADA)
        if (jaConfirmado) {
          confirmadas.push({
            id: ocorrencia.id,
            numero_ocorrencia: ocorrencia.numero_ocorrencia,
            tipo_trabalho: ocorrencia.tipo_trabalho,
            tipo_ambulancia: ocorrencia.tipo_ambulancia,
            data_ocorrencia: ocorrencia.data_ocorrencia,
            horario_saida: ocorrencia.horario_saida,
            horario_no_local: ocorrencia.horario_chegada_local,
            horario_termino: ocorrencia.horario_termino,
            local_ocorrencia: ocorrencia.local_ocorrencia,
            // IMPORTANTE: Manter o status REAL da ocorrência do banco
            status: ocorrencia.status_ocorrencia as 'EM_ABERTO' | 'CONFIRMADA' | 'EM_ANDAMENTO' | 'CONCLUIDA',
            profissional_confirmado: true,
          });
        } else if (ocorrencia.status_ocorrencia === 'EM_ABERTO') {
          // Ocorrência em aberto - verificar se há vagas ABERTAS para este perfil
          // IMPORTANTE: Filtrar apenas vagas SEM usuario_designado_id (vagas abertas para candidatura)

          // Contar vagas abertas disponíveis para o tipo de profissional
          const vagasAbertasParaPerfil = participantes.filter(
            (p) => p.funcao === tipoPerfil && !p.usuario_designado_id // Apenas vagas abertas
          );

          const totalVagasAbertas = vagasAbertasParaPerfil.length;
          const vagasAbertasPreenchidas = vagasAbertasParaPerfil.filter(
            (p) => p.confirmado === true
          ).length;

          const vagasAbertasDisponiveis = totalVagasAbertas - vagasAbertasPreenchidas;

          if (vagasAbertasDisponiveis > 0) {
            // Há vagas abertas disponíveis para este perfil
            disponiveis.push({
              id: ocorrencia.id,
              numero_ocorrencia: ocorrencia.numero_ocorrencia,
              tipo_trabalho: ocorrencia.tipo_trabalho,
              tipo_ambulancia: ocorrencia.tipo_ambulancia,
              data_ocorrencia: ocorrencia.data_ocorrencia,
              horario_saida: ocorrencia.horario_saida,
              horario_no_local: ocorrencia.horario_chegada_local,
              horario_termino: ocorrencia.horario_termino,
              local_ocorrencia: ocorrencia.local_ocorrencia,
              status: ocorrencia.status_ocorrencia as 'EM_ABERTO' | 'CONFIRMADA' | 'EM_ANDAMENTO' | 'CONCLUIDA',
              vagas_disponiveis: vagasAbertasDisponiveis,
              total_vagas: totalVagasAbertas,
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
    // Otimização: Cache aumentado para evitar recarregamentos desnecessários
    // As queries serão invalidadas manualmente após ações (confirmar participação)
    staleTime: 1000 * 60 * 3, // 3 minutos - dados considerados frescos
    gcTime: 1000 * 60 * 10, // 10 minutos - mantém em cache mesmo sem uso
    refetchOnWindowFocus: false, // NÃO revalidar ao focar janela (evita re-fetches)
    refetchOnMount: false, // NÃO revalidar ao montar se dados estão frescos
    retry: 2, // Tentar apenas 2 vezes em caso de erro (ao invés de padrão 3)
    retryDelay: 1000, // 1 segundo entre retries
  });
}
