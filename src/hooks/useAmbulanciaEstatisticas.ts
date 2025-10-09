import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

/**
 * Hook para buscar estatísticas completas de uma ambulância
 *
 * Retorna:
 * - Estatísticas de utilização por período
 * - Histórico de manutenções
 * - Gastos associados
 * - Ocorrências atendidas
 */

interface EstatisticasUtilizacao {
  mes: string;
  ocorrencias: number;
  horasUso: number;
  kmRodados: number;
}

interface Manutencao {
  id: number;
  tipo_manutencao: string;
  descricao: string;
  data_manutencao: string;
  custo: number;
  oficina: string;
  status: string;
}

interface Gasto {
  id: number;
  tipo_gasto: string;
  descricao: string;
  valor: number;
  data_gasto: string;
  responsavel: string;
}

interface OcorrenciaAtendida {
  id: number;
  numero_ocorrencia: string;
  tipo_ocorrencia: string;
  data_inicio: string;
  duracao_minutos: number;
  km_percorridos: number;
}

interface AmbulanciaEstatisticas {
  utilizacao: EstatisticasUtilizacao[];
  manutencoes: Manutencao[];
  gastos: Gasto[];
  ocorrencias: OcorrenciaAtendida[];
  resumo: {
    totalOcorrencias: number;
    totalKm: number;
    totalHoras: number;
    custoTotal: number;
    mediaOcorrenciasPorMes: number;
  };
}

export function useAmbulanciaEstatisticas(ambulanciaId: number | null, periodo: 'mes' | 'trimestre' | 'ano' = 'mes') {
  return useQuery<AmbulanciaEstatisticas>({
    queryKey: ['ambulancia-estatisticas', ambulanciaId, periodo],
    queryFn: async () => {
      if (!ambulanciaId) throw new Error('ID da ambulância não fornecido');

      // Calcular data inicial baseada no período
      const dataFim = new Date();
      const dataInicio = new Date();

      switch (periodo) {
        case 'mes':
          dataInicio.setMonth(dataInicio.getMonth() - 1);
          break;
        case 'trimestre':
          dataInicio.setMonth(dataInicio.getMonth() - 3);
          break;
        case 'ano':
          dataInicio.setFullYear(dataInicio.getFullYear() - 1);
          break;
      }

      // 1. Buscar ocorrências atendidas pela ambulância
      const { data: ocorrencias, error: ocorrenciasError } = await supabase
        .from('ocorrencias')
        .select('id, numero_ocorrencia, tipo_ocorrencia, data_inicio, data_fim, km_percorridos')
        .eq('ambulancia_id', ambulanciaId)
        .gte('data_inicio', dataInicio.toISOString())
        .lte('data_inicio', dataFim.toISOString())
        .order('data_inicio', { ascending: false });

      if (ocorrenciasError) throw ocorrenciasError;

      // 2. Buscar manutenções
      const { data: manutencoes, error: manutencoesError } = await supabase
        .from('ambulancias')
        .select(`
          historico_manutencoes
        `)
        .eq('id', ambulanciaId)
        .single();

      if (manutencoesError) throw manutencoesError;

      // 3. Buscar gastos
      const { data: gastos, error: gastosError } = await supabase
        .from('gastos')
        .select('*')
        .eq('ambulancia_id', ambulanciaId)
        .gte('data_gasto', dataInicio.toISOString())
        .lte('data_gasto', dataFim.toISOString())
        .order('data_gasto', { ascending: false });

      if (gastosError) throw gastosError;

      // Processar ocorrências para estatísticas de utilização
      const utilizacaoPorMes = new Map<string, EstatisticasUtilizacao>();

      ocorrencias?.forEach((ocorrencia) => {
        const data = new Date(ocorrencia.data_inicio);
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;

        const duracao = ocorrencia.data_fim
          ? (new Date(ocorrencia.data_fim).getTime() - new Date(ocorrencia.data_inicio).getTime()) / (1000 * 60 * 60)
          : 0;

        if (!utilizacaoPorMes.has(mesAno)) {
          utilizacaoPorMes.set(mesAno, {
            mes: mesAno,
            ocorrencias: 0,
            horasUso: 0,
            kmRodados: 0,
          });
        }

        const stats = utilizacaoPorMes.get(mesAno)!;
        stats.ocorrencias++;
        stats.horasUso += duracao;
        stats.kmRodados += ocorrencia.km_percorridos || 0;
      });

      const utilizacao = Array.from(utilizacaoPorMes.values()).sort((a, b) => a.mes.localeCompare(b.mes));

      // Processar ocorrências para lista
      const ocorrenciasProcessadas: OcorrenciaAtendida[] = ocorrencias?.map((oc) => ({
        id: oc.id,
        numero_ocorrencia: oc.numero_ocorrencia,
        tipo_ocorrencia: oc.tipo_ocorrencia,
        data_inicio: oc.data_inicio,
        duracao_minutos: oc.data_fim
          ? (new Date(oc.data_fim).getTime() - new Date(oc.data_inicio).getTime()) / (1000 * 60)
          : 0,
        km_percorridos: oc.km_percorridos || 0,
      })) || [];

      // Processar manutenções (do JSON)
      const manutencoesProcessadas: Manutencao[] = manutencoes?.historico_manutencoes || [];

      // Calcular resumo
      const totalOcorrencias = ocorrencias?.length || 0;
      const totalKm = ocorrenciasProcessadas.reduce((sum, oc) => sum + oc.km_percorridos, 0);
      const totalHoras = ocorrenciasProcessadas.reduce((sum, oc) => sum + oc.duracao_minutos / 60, 0);
      const custoTotal = (gastos?.reduce((sum, g) => sum + g.valor, 0) || 0) +
                         (manutencoesProcessadas.reduce((sum, m) => sum + (m.custo || 0), 0));
      const mesesPeriodo = utilizacao.length || 1;
      const mediaOcorrenciasPorMes = totalOcorrencias / mesesPeriodo;

      return {
        utilizacao,
        manutencoes: manutencoesProcessadas,
        gastos: gastos || [],
        ocorrencias: ocorrenciasProcessadas,
        resumo: {
          totalOcorrencias,
          totalKm,
          totalHoras,
          custoTotal,
          mediaOcorrenciasPorMes,
        },
      };
    },
    enabled: !!ambulanciaId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 15, // 15 minutos
    refetchOnWindowFocus: false,
  });
}
