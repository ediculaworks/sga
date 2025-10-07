import { supabase } from '@/lib/supabase/client';
import type {
  EquipamentoCatalogo,
  EstoqueAmbulancia,
  EstoqueBaixo,
  CategoriaEquipamento,
  TipoAmbulancia
} from '@/types';

/**
 * Serviço de Equipamentos
 * Gerencia operações relacionadas ao catálogo de equipamentos e estoque
 */

export const equipamentosService = {
  /**
   * Busca todos os equipamentos do catálogo
   */
  async getCatalogo() {
    const { data, error } = await supabase
      .from('equipamentos_catalogo')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data as EquipamentoCatalogo[];
  },

  /**
   * Busca equipamentos por tipo de ambulância
   */
  async getByTipoAmbulancia(tipo: TipoAmbulancia) {
    const { data, error } = await supabase
      .from('equipamentos_catalogo')
      .select('*')
      .eq('tipo_ambulancia', tipo)
      .order('categoria', { ascending: true })
      .order('nome', { ascending: true });

    if (error) throw error;
    return data as EquipamentoCatalogo[];
  },

  /**
   * Busca equipamentos por categoria
   */
  async getByCategoria(categoria: CategoriaEquipamento) {
    const { data, error } = await supabase
      .from('equipamentos_catalogo')
      .select('*')
      .eq('categoria', categoria)
      .order('nome');

    if (error) throw error;
    return data as EquipamentoCatalogo[];
  },

  /**
   * Busca estoque de uma ambulância
   */
  async getEstoqueAmbulancia(ambulanciaId: number) {
    const { data, error } = await supabase
      .from('estoque_ambulancias')
      .select('*, equipamento:equipamentos_catalogo(*)')
      .eq('ambulancia_id', ambulanciaId)
      .order('equipamento.categoria');

    if (error) throw error;
    return data;
  },

  /**
   * Busca itens com estoque baixo
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
   * Busca itens com estoque baixo de uma ambulância específica
   */
  async getEstoqueBaixoAmbulancia(ambulanciaId: number) {
    const { data, error } = await supabase
      .from('estoque_ambulancias')
      .select('*, equipamento:equipamentos_catalogo(*), ambulancia:ambulancias(placa)')
      .eq('ambulancia_id', ambulanciaId);

    if (error) throw error;

    // Filtrar no cliente onde quantidade_atual < quantidade_minima
    const estoqueBaixo = data?.filter(item =>
      item.quantidade_atual < item.quantidade_minima
    ) || [];

    return estoqueBaixo;
  },

  /**
   * Atualiza quantidade em estoque
   */
  async atualizarEstoque(
    ambulanciaId: number,
    equipamentoId: number,
    quantidadeAtual: number
  ) {
    const { data, error } = await supabase
      .from('estoque_ambulancias')
      .upsert([
        {
          ambulancia_id: ambulanciaId,
          equipamento_id: equipamentoId,
          quantidade_atual: quantidadeAtual,
          ultima_verificacao: new Date().toISOString()
        }
      ], { onConflict: 'ambulancia_id,equipamento_id' })
      .select()
      .single();

    if (error) throw error;
    return data as EstoqueAmbulancia;
  },

  /**
   * Adiciona quantidade ao estoque
   */
  async adicionarEstoque(
    ambulanciaId: number,
    equipamentoId: number,
    quantidade: number
  ) {
    // Primeiro busca o estoque atual
    const { data: estoqueAtual, error: selectError } = await supabase
      .from('estoque_ambulancias')
      .select('quantidade_atual')
      .eq('ambulancia_id', ambulanciaId)
      .eq('equipamento_id', equipamentoId)
      .single();

    if (selectError) throw selectError;

    const novaQuantidade = (estoqueAtual?.quantidade_atual || 0) + quantidade;

    const { data, error } = await supabase
      .from('estoque_ambulancias')
      .upsert([
        {
          ambulancia_id: ambulanciaId,
          equipamento_id: equipamentoId,
          quantidade_atual: novaQuantidade,
          ultima_verificacao: new Date().toISOString()
        }
      ], { onConflict: 'ambulancia_id,equipamento_id' })
      .select()
      .single();

    if (error) throw error;
    return data as EstoqueAmbulancia;
  },

  /**
   * Remove quantidade do estoque
   */
  async removerEstoque(
    ambulanciaId: number,
    equipamentoId: number,
    quantidade: number
  ) {
    // Primeiro busca o estoque atual
    const { data: estoqueAtual, error: selectError } = await supabase
      .from('estoque_ambulancias')
      .select('quantidade_atual')
      .eq('ambulancia_id', ambulanciaId)
      .eq('equipamento_id', equipamentoId)
      .single();

    if (selectError) throw selectError;

    const novaQuantidade = Math.max(0, (estoqueAtual?.quantidade_atual || 0) - quantidade);

    const { data, error } = await supabase
      .from('estoque_ambulancias')
      .update({
        quantidade_atual: novaQuantidade,
        ultima_verificacao: new Date().toISOString()
      })
      .eq('ambulancia_id', ambulanciaId)
      .eq('equipamento_id', equipamentoId)
      .select()
      .single();

    if (error) throw error;
    return data as EstoqueAmbulancia;
  },

  /**
   * Cria novo equipamento no catálogo
   */
  async createEquipamento(equipamento: Omit<EquipamentoCatalogo, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('equipamentos_catalogo')
      .insert([equipamento])
      .select()
      .single();

    if (error) throw error;
    return data as EquipamentoCatalogo;
  },

  /**
   * Atualiza equipamento no catálogo
   */
  async updateEquipamento(id: number, equipamento: Partial<EquipamentoCatalogo>) {
    const { data, error } = await supabase
      .from('equipamentos_catalogo')
      .update(equipamento)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as EquipamentoCatalogo;
  },

  /**
   * Deleta equipamento do catálogo
   */
  async deleteEquipamento(id: number) {
    const { error } = await supabase
      .from('equipamentos_catalogo')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
