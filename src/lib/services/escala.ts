import { supabase } from '@/lib/supabase/client';
import type { Escala, ProfissionalDisponivel } from '@/types';

/**
 * Serviço de Escala
 * Gerencia operações relacionadas à escala de profissionais
 */

export const escalaService = {
  /**
   * Busca todas as escalas
   */
  async getAll() {
    const { data, error } = await supabase
      .from('escala')
      .select('*, usuario:usuarios(*)')
      .order('data', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Busca escala por data
   */
  async getByData(data: string) {
    const { data: escala, error } = await supabase
      .from('escala')
      .select('*, usuario:usuarios(*)')
      .eq('data', data)
      .order('usuario.nome_completo');

    if (error) throw error;
    return escala;
  },

  /**
   * Busca escala por usuário e data
   */
  async getByUsuarioData(usuarioId: number, data: string) {
    const { data: escala, error } = await supabase
      .from('escala')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('data', data)
      .single();

    if (error) throw error;
    return escala as Escala;
  },

  /**
   * Busca escala de um usuário
   */
  async getByUsuario(usuarioId: number) {
    const { data, error } = await supabase
      .from('escala')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('data', { ascending: false });

    if (error) throw error;
    return data as Escala[];
  },

  /**
   * Busca profissionais disponíveis por data
   */
  async getProfissionaisDisponiveis(data: string) {
    const { data: profissionais, error } = await supabase
      .from('vw_profissionais_disponiveis')
      .select('*')
      .eq('data', data);

    if (error) throw error;
    return profissionais as ProfissionalDisponivel[];
  },

  /**
   * Cria ou atualiza escala
   */
  async upsert(escala: Omit<Escala, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('escala')
      .upsert([escala], { onConflict: 'usuario_id,data' })
      .select()
      .single();

    if (error) throw error;
    return data as Escala;
  },

  /**
   * Marca profissional como disponível
   */
  async marcarDisponivel(usuarioId: number, data: string, observacoes?: string) {
    const { data: escala, error } = await supabase
      .from('escala')
      .upsert([
        {
          usuario_id: usuarioId,
          data,
          disponivel: true,
          observacoes
        }
      ], { onConflict: 'usuario_id,data' })
      .select()
      .single();

    if (error) throw error;
    return escala as Escala;
  },

  /**
   * Marca profissional como indisponível
   */
  async marcarIndisponivel(usuarioId: number, data: string, observacoes?: string) {
    const { data: escala, error } = await supabase
      .from('escala')
      .upsert([
        {
          usuario_id: usuarioId,
          data,
          disponivel: false,
          observacoes
        }
      ], { onConflict: 'usuario_id,data' })
      .select()
      .single();

    if (error) throw error;
    return escala as Escala;
  },

  /**
   * Deleta uma escala
   */
  async delete(id: number) {
    const { error } = await supabase
      .from('escala')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
