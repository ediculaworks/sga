import { supabase } from '@/lib/supabase/client';
import type { Ambulancia, AmbulanciaFormData, StatusAmbulancia, TipoAmbulancia } from '@/types';

/**
 * Serviço de Ambulâncias
 * Gerencia operações CRUD e consultas relacionadas a ambulâncias
 */

export const ambulanciasService = {
  /**
   * Busca todas as ambulâncias
   */
  async getAll() {
    const { data, error } = await supabase
      .from('ambulancias')
      .select('*')
      .order('placa');

    if (error) throw error;
    return data as Ambulancia[];
  },

  /**
   * Busca ambulâncias ativas
   */
  async getAtivas() {
    const { data, error } = await supabase
      .from('ambulancias')
      .select('*')
      .eq('ativo', true)
      .order('placa');

    if (error) throw error;
    return data as Ambulancia[];
  },

  /**
   * Busca ambulâncias por status
   */
  async getByStatus(status: StatusAmbulancia) {
    const { data, error } = await supabase
      .from('ambulancias')
      .select('*')
      .eq('status_ambulancia', status)
      .eq('ativo', true)
      .order('placa');

    if (error) throw error;
    return data as Ambulancia[];
  },

  /**
   * Busca ambulâncias prontas (disponíveis para uso)
   */
  async getProntas() {
    const { data, error } = await supabase
      .from('ambulancias')
      .select('*')
      .eq('status_ambulancia', 'PRONTA')
      .eq('ativo', true)
      .order('placa');

    if (error) throw error;
    return data as Ambulancia[];
  },

  /**
   * Busca ambulâncias por tipo
   */
  async getByTipo(tipo: TipoAmbulancia) {
    const { data, error } = await supabase
      .from('ambulancias')
      .select('*')
      .eq('tipo_atual', tipo)
      .eq('ativo', true)
      .order('placa');

    if (error) throw error;
    return data as Ambulancia[];
  },

  /**
   * Busca uma ambulância por ID
   */
  async getById(id: number) {
    const { data, error } = await supabase
      .from('ambulancias')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Ambulancia;
  },

  /**
   * Busca uma ambulância por placa
   */
  async getByPlaca(placa: string) {
    const { data, error } = await supabase
      .from('ambulancias')
      .select('*')
      .eq('placa', placa)
      .single();

    if (error) throw error;
    return data as Ambulancia;
  },

  /**
   * Cria uma nova ambulância
   */
  async create(ambulancia: AmbulanciaFormData) {
    const { data, error } = await supabase
      .from('ambulancias')
      .insert([ambulancia])
      .select()
      .single();

    if (error) throw error;
    return data as Ambulancia;
  },

  /**
   * Atualiza uma ambulância
   */
  async update(id: number, ambulancia: Partial<AmbulanciaFormData>) {
    const { data, error } = await supabase
      .from('ambulancias')
      .update(ambulancia)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Ambulancia;
  },

  /**
   * Atualiza a kilometragem de uma ambulância
   */
  async atualizarKilometragem(id: number, kilometragem: number) {
    const { data, error } = await supabase
      .from('ambulancias')
      .update({ kilometragem })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Ambulancia;
  },

  /**
   * Atualiza o status de uma ambulância
   */
  async atualizarStatus(id: number, status: StatusAmbulancia) {
    const { data, error } = await supabase
      .from('ambulancias')
      .update({ status_ambulancia: status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Ambulancia;
  },

  /**
   * Desativa uma ambulância (soft delete)
   */
  async desativar(id: number) {
    const { data, error } = await supabase
      .from('ambulancias')
      .update({ ativo: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Ambulancia;
  },

  /**
   * Reativa uma ambulância
   */
  async reativar(id: number) {
    const { data, error } = await supabase
      .from('ambulancias')
      .update({ ativo: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Ambulancia;
  },

  /**
   * Deleta permanentemente uma ambulância
   */
  async delete(id: number) {
    const { error } = await supabase
      .from('ambulancias')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
