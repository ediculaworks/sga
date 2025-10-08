import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useState } from 'react';

/**
 * Hook para buscar estatísticas do médico
 *
 * Busca dados de ocorrências atendidas, pagamentos pendentes e remoções.
 */

type PeriodoFiltro = 'semana' | 'mes' | 'ano';

interface StatsData {
  ocorrenciasAtendidas: {
    total: number;
    trend: number;
  };
  ocorrenciasAReceber: {
    total: number;
    valorTotal: number;
    itens: Array<{
      id: number;
      data: string;
      valor: number;
    }>;
  };
  remocoes: {
    total: number;
  };
}

export function useMedicoStats(medicoId: number) {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('semana');

  // Calcular datas baseado no período
  const getDateRange = () => {
    const hoje = new Date();
    let dataInicio = new Date();

    switch (periodo) {
      case 'semana':
        dataInicio.setDate(hoje.getDate() - 7);
        break;
      case 'mes':
        dataInicio.setMonth(hoje.getMonth() - 1);
        break;
      case 'ano':
        dataInicio.setFullYear(hoje.getFullYear() - 1);
        break;
    }

    return {
      dataInicio: dataInicio.toISOString(),
      dataFim: hoje.toISOString(),
    };
  };

  // Query para ocorrências atendidas
  const { data: ocorrenciasData, isLoading: isLoadingOcorrencias } = useQuery({
    queryKey: ['medico-ocorrencias', medicoId, periodo],
    queryFn: async () => {
      const { dataInicio, dataFim } = getDateRange();

      // Buscar participações do médico no período
      const { data: participacoes, error } = await supabase
        .from('ocorrencias_participantes')
        .select(`
          id,
          ocorrencia:ocorrencias!inner(
            id,
            data_ocorrencia,
            status
          )
        `)
        .eq('usuario_id', medicoId)
        .eq('confirmado', true)
        .gte('ocorrencia.data_ocorrencia', dataInicio)
        .lte('ocorrencia.data_ocorrencia', dataFim);

      if (error) throw error;

      // Contar ocorrências concluídas
      const totalAtendidas = participacoes?.filter(
        (p: any) => p.ocorrencia?.status === 'CONCLUIDA'
      ).length || 0;

      // Calcular período anterior para comparação
      let dataInicioAnterior = new Date(dataInicio);
      switch (periodo) {
        case 'semana':
          dataInicioAnterior.setDate(dataInicioAnterior.getDate() - 7);
          break;
        case 'mes':
          dataInicioAnterior.setMonth(dataInicioAnterior.getMonth() - 1);
          break;
        case 'ano':
          dataInicioAnterior.setFullYear(dataInicioAnterior.getFullYear() - 1);
          break;
      }

      const { data: participacoesAnteriores } = await supabase
        .from('ocorrencias_participantes')
        .select(`
          id,
          ocorrencia:ocorrencias!inner(
            id,
            status
          )
        `)
        .eq('usuario_id', medicoId)
        .eq('confirmado', true)
        .gte('ocorrencia.data_ocorrencia', dataInicioAnterior.toISOString())
        .lt('ocorrencia.data_ocorrencia', dataInicio);

      const totalAnterior = participacoesAnteriores?.filter(
        (p: any) => p.ocorrencia?.status === 'CONCLUIDA'
      ).length || 0;

      // Calcular trend
      const trend = totalAnterior > 0
        ? Math.round(((totalAtendidas - totalAnterior) / totalAnterior) * 100)
        : 0;

      return {
        total: totalAtendidas,
        trend,
      };
    },
    enabled: !!medicoId,
  });

  // Query para ocorrências a receber (pagamentos pendentes)
  const { data: pagamentosData, isLoading: isLoadingPagamentos } = useQuery({
    queryKey: ['medico-pagamentos', medicoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ocorrencias_participantes')
        .select(`
          id,
          valor_pago,
          pago,
          ocorrencia:ocorrencias!inner(
            id,
            data_ocorrencia,
            data_pagamento
          )
        `)
        .eq('usuario_id', medicoId)
        .eq('pago', false)
        .eq('ocorrencia.status', 'CONCLUIDA');

      if (error) throw error;

      const valorTotal = data?.reduce((acc: number, item: any) => acc + (item.valor_pago || 0), 0) || 0;

      const itens = data?.map((item: any) => ({
        id: item.ocorrencia.id,
        data: item.ocorrencia.data_pagamento || item.ocorrencia.data_ocorrencia,
        valor: item.valor_pago || 0,
      })) || [];

      return {
        total: data?.length || 0,
        valorTotal,
        itens,
      };
    },
    enabled: !!medicoId,
  });

  // Query para remoções
  const { data: removoesData, isLoading: isLoadingRemocoes } = useQuery({
    queryKey: ['medico-remocoes', medicoId, periodo],
    queryFn: async () => {
      const { dataInicio, dataFim } = getDateRange();

      // Buscar atendimentos com remoção
      const { data, error } = await supabase
        .from('atendimentos')
        .select(`
          id,
          remocao,
          ocorrencia:ocorrencias!inner(
            id,
            data_ocorrencia,
            participantes:ocorrencias_participantes!inner(
              usuario_id
            )
          )
        `)
        .eq('remocao', true)
        .eq('ocorrencia.participantes.usuario_id', medicoId)
        .gte('ocorrencia.data_ocorrencia', dataInicio)
        .lte('ocorrencia.data_ocorrencia', dataFim);

      if (error) throw error;

      return {
        total: data?.length || 0,
      };
    },
    enabled: !!medicoId,
  });

  const isLoading = isLoadingOcorrencias || isLoadingPagamentos || isLoadingRemocoes;

  const stats: StatsData = {
    ocorrenciasAtendidas: ocorrenciasData || { total: 0, trend: 0 },
    ocorrenciasAReceber: pagamentosData || { total: 0, valorTotal: 0, itens: [] },
    remocoes: removoesData || { total: 0 },
  };

  return {
    stats,
    isLoading,
    periodo,
    setPeriodo,
  };
}
