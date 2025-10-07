import { supabase } from '@/lib/supabase/client';
import type { Usuario, UsuarioFormData, TipoPerfil } from '@/types';

/**
 * Serviço de Usuários
 * Gerencia operações CRUD e consultas relacionadas a usuários
 */

export const usuariosService = {
  /**
   * Busca todos os usuários
   */
  async getAll() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Usuario[];
  },

  /**
   * Busca usuários ativos
   */
  async getAtivos() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('ativo', true)
      .order('nome_completo');

    if (error) throw error;
    return data as Usuario[];
  },

  /**
   * Busca usuários por tipo de perfil
   */
  async getByTipoPerfil(tipoPerfil: TipoPerfil) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('tipo_perfil', tipoPerfil)
      .eq('ativo', true)
      .order('nome_completo');

    if (error) throw error;
    return data as Usuario[];
  },

  /**
   * Busca um usuário por ID
   */
  async getById(id: number) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Usuario;
  },

  /**
   * Busca um usuário por CPF
   */
  async getByCPF(cpf: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('cpf', cpf)
      .single();

    if (error) throw error;
    return data as Usuario;
  },

  /**
   * Busca um usuário por email
   */
  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data as Usuario;
  },

  /**
   * Cria um novo usuário
   */
  async create(usuario: UsuarioFormData) {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([usuario])
      .select()
      .single();

    if (error) throw error;
    return data as Usuario;
  },

  /**
   * Atualiza um usuário
   */
  async update(id: number, usuario: Partial<UsuarioFormData>) {
    const { data, error } = await supabase
      .from('usuarios')
      .update(usuario)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Usuario;
  },

  /**
   * Desativa um usuário (soft delete)
   */
  async desativar(id: number) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ ativo: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Usuario;
  },

  /**
   * Reativa um usuário
   */
  async reativar(id: number) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ ativo: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Usuario;
  },

  /**
   * Deleta permanentemente um usuário
   */
  async delete(id: number) {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
