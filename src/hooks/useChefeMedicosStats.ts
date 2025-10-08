import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

/**
 * Hook para buscar estatísticas agregadas do sistema (Chefe dos Médicos)
 *
 * FASE 7.1 - Dashboard do Chefe dos Médicos
 */

interface ChefeMedicosStats {
  ambulanciasAtivas: number;
  profissionaisDisponiveis: number;
  ocorrenciasHoje: number;
  ocorrenciasSemana: number;
  ocorrenciasMes: number;
  tempoMedioResposta: number | null; // em minutos
}

interface Aviso {
  id: string;
  tipo: 'manutencao' | 'cnh_vencida' | 'cnh_vencendo' | 'estoque_baixo';
  titulo: string;
  descricao: string;
  severidade: 'alta' | 'media' | 'baixa';
  data?: string;
}

export function useChefeMedicosStats() {
  // Query 1: Ambulâncias ativas (EM_OPERACAO)
  const { data: ambulanciasAtivas = 0, isLoading: loadingAmbulancias } = useQuery({
    queryKey: ['ambulancias-ativas'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('ambulancias')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'EM_OPERACAO');

      if (error) throw error;
      return count || 0;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  // Query 2: Profissionais disponíveis hoje
  const { data: profissionaisDisponiveis = 0, isLoading: loadingProfissionais } = useQuery({
    queryKey: ['profissionais-disponiveis'],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('escala')
        .select('usuario_id', { count: 'exact' })
        .eq('data', hoje)
        .eq('disponivel', true);

      if (error) throw error;
      return data?.length || 0;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Query 3: Ocorrências (hoje, semana, mês)
  const { data: ocorrencias, isLoading: loadingOcorrencias } = useQuery({
    queryKey: ['ocorrencias-stats'],
    queryFn: async () => {
      const hoje = new Date();
      const inicioDia = new Date(hoje.setHours(0, 0, 0, 0)).toISOString().split('T')[0];
      const inicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      // Hoje
      const { count: countHoje, error: errorHoje } = await supabase
        .from('ocorrencias')
        .select('*', { count: 'exact', head: true })
        .eq('data_ocorrencia', inicioDia);

      if (errorHoje) throw errorHoje;

      // Semana
      const { count: countSemana, error: errorSemana } = await supabase
        .from('ocorrencias')
        .select('*', { count: 'exact', head: true })
        .gte('data_ocorrencia', inicioSemana.toISOString().split('T')[0]);

      if (errorSemana) throw errorSemana;

      // Mês
      const { count: countMes, error: errorMes } = await supabase
        .from('ocorrencias')
        .select('*', { count: 'exact', head: true })
        .gte('data_ocorrencia', inicioMes.toISOString().split('T')[0]);

      if (errorMes) throw errorMes;

      return {
        hoje: countHoje || 0,
        semana: countSemana || 0,
        mes: countMes || 0,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  // Query 4: Tempo médio de resposta (em minutos)
  const { data: tempoMedioResposta = null, isLoading: loadingTempo } = useQuery({
    queryKey: ['tempo-medio-resposta'],
    queryFn: async () => {
      // Buscar ocorrências concluídas da última semana
      const inicioDaSemana = new Date();
      inicioDaSemana.setDate(inicioDaSemana.getDate() - 7);

      const { data, error } = await supabase
        .from('ocorrencias')
        .select('data_inicio, data_conclusao')
        .eq('status_ocorrencia', 'CONCLUIDA')
        .not('data_inicio', 'is', null)
        .not('data_conclusao', 'is', null)
        .gte('data_ocorrencia', inicioDaSemana.toISOString().split('T')[0]);

      if (error) throw error;

      if (!data || data.length === 0) return null;

      // Calcular média de duração em minutos
      const duracoes = data.map((ocorrencia) => {
        const inicio = new Date(ocorrencia.data_inicio!);
        const conclusao = new Date(ocorrencia.data_conclusao!);
        return (conclusao.getTime() - inicio.getTime()) / (1000 * 60); // minutos
      });

      const media = duracoes.reduce((acc, val) => acc + val, 0) / duracoes.length;
      return Math.round(media);
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Query 5: Avisos do sistema
  const { data: avisos = [], isLoading: loadingAvisos } = useQuery({
    queryKey: ['avisos-sistema'],
    queryFn: async (): Promise<Aviso[]> => {
      const avisosList: Aviso[] = [];

      // 1. Ambulâncias em manutenção/revisão
      const { data: ambulanciasManutencao, error: errorAmb } = await supabase
        .from('ambulancias')
        .select('placa, modelo')
        .in('status', ['REVISAO', 'PENDENTE']);

      if (!errorAmb && ambulanciasManutencao) {
        ambulanciasManutencao.forEach((amb) => {
          avisosList.push({
            id: `amb-${amb.placa}`,
            tipo: 'manutencao',
            titulo: 'Ambulância em Manutenção',
            descricao: `${amb.modelo} (${amb.placa}) não está operacional`,
            severidade: 'media',
          });
        });
      }

      // 2. CNH vencidas ou próximas de vencer (30 dias)
      const hoje = new Date();
      const em30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

      const { data: motoristas, error: errorCNH } = await supabase
        .from('motoristas')
        .select(`
          cnh,
          validade_cnh,
          usuarios:usuario_id (
            nome_completo
          )
        `)
        .lte('validade_cnh', em30Dias.toISOString().split('T')[0]);

      if (!errorCNH && motoristas) {
        motoristas.forEach((motorista: any) => {
          const validade = new Date(motorista.validade_cnh);
          const vencida = validade < hoje;

          avisosList.push({
            id: `cnh-${motorista.cnh}`,
            tipo: vencida ? 'cnh_vencida' : 'cnh_vencendo',
            titulo: vencida ? 'CNH Vencida' : 'CNH Próxima do Vencimento',
            descricao: `${motorista.usuarios?.nome_completo} - Vence em ${validade.toLocaleDateString('pt-BR')}`,
            severidade: vencida ? 'alta' : 'media',
            data: motorista.validade_cnh,
          });
        });
      }

      // 3. Estoque baixo (quantidade < quantidade_minima)
      const { data: estoqueBaixo, error: errorEstoque } = await supabase
        .from('estoque_ambulancias')
        .select(`
          id,
          quantidade_atual,
          quantidade_minima,
          equipamentos:equipamento_id (
            nome
          ),
          ambulancias:ambulancia_id (
            placa
          )
        `)
        .lt('quantidade_atual', supabase.rpc('quantidade_minima'));

      // Como o RPC acima pode não funcionar, vou fazer client-side filter
      const { data: todosEstoques, error: errorTodosEstoques } = await supabase
        .from('estoque_ambulancias')
        .select(`
          id,
          quantidade_atual,
          quantidade_minima,
          equipamentos:equipamento_id (
            nome
          ),
          ambulancias:ambulancia_id (
            placa
          )
        `);

      if (!errorTodosEstoques && todosEstoques) {
        todosEstoques
          .filter((est: any) => est.quantidade_atual < est.quantidade_minima)
          .forEach((est: any) => {
            avisosList.push({
              id: `estoque-${est.id}`,
              tipo: 'estoque_baixo',
              titulo: 'Estoque Baixo',
              descricao: `${est.equipamentos?.nome} na ambulância ${est.ambulancias?.placa} - ${est.quantidade_atual}/${est.quantidade_minima}`,
              severidade: est.quantidade_atual === 0 ? 'alta' : 'media',
            });
          });
      }

      // Ordenar por severidade (alta → média → baixa)
      return avisosList.sort((a, b) => {
        const ordem = { alta: 0, media: 1, baixa: 2 };
        return ordem[a.severidade] - ordem[b.severidade];
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const stats: ChefeMedicosStats = {
    ambulanciasAtivas,
    profissionaisDisponiveis,
    ocorrenciasHoje: ocorrencias?.hoje || 0,
    ocorrenciasSemana: ocorrencias?.semana || 0,
    ocorrenciasMes: ocorrencias?.mes || 0,
    tempoMedioResposta,
  };

  return {
    stats,
    avisos,
    isLoading:
      loadingAmbulancias ||
      loadingProfissionais ||
      loadingOcorrencias ||
      loadingTempo ||
      loadingAvisos,
  };
}
