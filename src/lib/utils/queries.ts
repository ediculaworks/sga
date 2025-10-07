import { supabase } from '@/lib/supabase/client';
import type {
  ResumoOcorrencia,
  EstatisticaAmbulancia,
  ProfissionalDisponivel,
  EstoqueBaixo,
  PagamentoPendente
} from '@/types';

/**
 * Utilitários para queries especiais e views
 */

export const queries = {
  /**
   * Busca resumo de ocorrências por período
   */
  async getResumoOcorrencias(dataInicio?: string, dataFim?: string) {
    let query = supabase.from('vw_resumo_ocorrencias').select('*');

    if (dataInicio) {
      query = query.gte('mes', dataInicio);
    }

    if (dataFim) {
      query = query.lte('mes', dataFim);
    }

    const { data, error } = await query.order('mes', { ascending: false });

    if (error) throw error;
    return data as ResumoOcorrencia[];
  },

  /**
   * Busca estatísticas de ambulâncias
   */
  async getEstatisticasAmbulancias() {
    const { data, error } = await supabase
      .from('vw_estatisticas_ambulancias')
      .select('*')
      .order('total_ocorrencias', { ascending: false });

    if (error) throw error;
    return data as EstatisticaAmbulancia[];
  },

  /**
   * Busca profissionais disponíveis por data
   */
  async getProfissionaisDisponiveis(data: string) {
    const { data: profissionais, error } = await supabase
      .from('vw_profissionais_disponiveis')
      .select('*')
      .eq('data', data)
      .eq('disponivel', true)
      .eq('livre_para_ocorrencias', true);

    if (error) throw error;
    return profissionais as ProfissionalDisponivel[];
  },

  /**
   * Busca estoque baixo de todas as ambulâncias
   */
  async getEstoqueBaixo() {
    const { data, error } = await supabase
      .from('vw_estoque_baixo')
      .select('*')
      .order('quantidade_a_repor', { ascending: false });

    if (error) throw error;
    return data as EstoqueBaixo[];
  },

  /**
   * Busca pagamentos pendentes
   */
  async getPagamentosPendentes() {
    const { data, error } = await supabase
      .from('vw_pagamentos_pendentes')
      .select('*')
      .order('data_ocorrencia', { ascending: false });

    if (error) throw error;
    return data as PagamentoPendente[];
  },

  /**
   * Busca dashboard do dia
   */
  async getDashboardDia(data?: string) {
    const hoje = data || new Date().toISOString().split('T')[0];

    // Ocorrências do dia
    const { data: ocorrencias, error: ocorrenciasError } = await supabase
      .from('ocorrencias')
      .select('*')
      .eq('data_ocorrencia', hoje);

    if (ocorrenciasError) throw ocorrenciasError;

    // Ambulâncias prontas
    const { data: ambulanciasProntas, error: ambulanciasError } = await supabase
      .from('ambulancias')
      .select('*')
      .eq('status_ambulancia', 'PRONTA')
      .eq('ativo', true);

    if (ambulanciasError) throw ambulanciasError;

    // Profissionais disponíveis
    const { data: profissionais, error: profissionaisError } = await supabase
      .from('vw_profissionais_disponiveis')
      .select('*')
      .eq('data', hoje)
      .eq('disponivel', true);

    if (profissionaisError) throw profissionaisError;

    // Estoque baixo
    const { data: estoqueBaixo, error: estoqueError } = await supabase
      .from('vw_estoque_baixo')
      .select('*');

    if (estoqueError) throw estoqueError;

    return {
      ocorrencias,
      ambulanciasProntas,
      profissionaisDisponiveis: profissionais,
      estoqueBaixo,
      data: hoje
    };
  },

  /**
   * Busca relatório mensal
   */
  async getRelatorioMensal(ano: number, mes: number) {
    const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(ano, mes, 0).getDate();
    const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${ultimoDia}`;

    // Ocorrências do mês
    const { data: ocorrencias, error: ocorrenciasError } = await supabase
      .from('ocorrencias')
      .select('*')
      .gte('data_ocorrencia', dataInicio)
      .lte('data_ocorrencia', dataFim);

    if (ocorrenciasError) throw ocorrenciasError;

    // Gastos do mês
    const { data: gastos, error: gastosError } = await supabase
      .from('gastos_ambulancias')
      .select('*')
      .gte('data_gasto', dataInicio)
      .lte('data_gasto', dataFim);

    if (gastosError) throw gastosError;

    // Pagamentos do mês
    const { data: pagamentos, error: pagamentosError } = await supabase
      .from('ocorrencias_participantes')
      .select('*, ocorrencia:ocorrencias(*), usuario:usuarios(*)')
      .gte('data_pagamento', dataInicio)
      .lte('data_pagamento', dataFim);

    if (pagamentosError) throw pagamentosError;

    const totalOcorrencias = ocorrencias?.length || 0;
    const totalGastos = gastos?.reduce((acc, g) => acc + Number(g.valor), 0) || 0;
    const totalPagamentos = pagamentos?.reduce((acc, p) => acc + Number(p.valor_pagamento || 0), 0) || 0;

    return {
      ocorrencias,
      gastos,
      pagamentos,
      totais: {
        ocorrencias: totalOcorrencias,
        gastos: totalGastos,
        pagamentos: totalPagamentos
      },
      periodo: {
        ano,
        mes,
        dataInicio,
        dataFim
      }
    };
  },

  /**
   * Busca histórico de uma ambulância
   */
  async getHistoricoAmbulancia(ambulanciaId: number) {
    // Ocorrências
    const { data: ocorrencias, error: ocorrenciasError } = await supabase
      .from('ocorrencias')
      .select('*')
      .eq('ambulancia_id', ambulanciaId)
      .order('data_ocorrencia', { ascending: false });

    if (ocorrenciasError) throw ocorrenciasError;

    // Gastos
    const { data: gastos, error: gastosError } = await supabase
      .from('gastos_ambulancias')
      .select('*')
      .eq('ambulancia_id', ambulanciaId)
      .order('data_gasto', { ascending: false });

    if (gastosError) throw gastosError;

    // Checklists técnicos
    const { data: checklistsTecnicos, error: checklistsError } = await supabase
      .from('checklist_tecnico_ambulancias')
      .select('*, verificador:usuarios(*)')
      .eq('ambulancia_id', ambulanciaId)
      .order('data_verificacao', { ascending: false });

    if (checklistsError) throw checklistsError;

    return {
      ocorrencias,
      gastos,
      checklistsTecnicos
    };
  },

  /**
   * Busca histórico de um profissional
   */
  async getHistoricoProfissional(usuarioId: number) {
    const { data, error } = await supabase
      .from('ocorrencias_participantes')
      .select(`
        *,
        ocorrencia:ocorrencias(
          *,
          ambulancia:ambulancias(*)
        )
      `)
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
