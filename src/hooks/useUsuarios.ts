import { useState, useEffect } from 'react';
import { usuariosService } from '@/lib/services';
import type { Usuario, TipoPerfil } from '@/types';

/**
 * Hook para gerenciar usuários
 */
export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usuariosService.getAll();
      setUsuarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  };

  const fetchByTipoPerfil = async (tipoPerfil: TipoPerfil) => {
    try {
      setLoading(true);
      setError(null);
      const data = await usuariosService.getByTipoPerfil(tipoPerfil);
      setUsuarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return {
    usuarios,
    loading,
    error,
    refetch: fetchUsuarios,
    fetchByTipoPerfil
  };
}

/**
 * Hook para um usuário específico
 */
export function useUsuario(id?: number) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuario = async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await usuariosService.getById(userId);
      setUsuario(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar usuário');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUsuario(id);
    }
  }, [id]);

  return {
    usuario,
    loading,
    error,
    refetch: id ? () => fetchUsuario(id) : undefined
  };
}
