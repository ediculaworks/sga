import { useState, useEffect } from 'react';
import { ambulanciasService } from '@/lib/services';
import type { Ambulancia, StatusAmbulancia, TipoAmbulancia } from '@/types';

/**
 * Hook para gerenciar ambulâncias
 */
export function useAmbulancias() {
  const [ambulancias, setAmbulancias] = useState<Ambulancia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAmbulancias = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ambulanciasService.getAll();
      setAmbulancias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar ambulâncias');
    } finally {
      setLoading(false);
    }
  };

  const fetchProntas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ambulanciasService.getProntas();
      setAmbulancias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar ambulâncias');
    } finally {
      setLoading(false);
    }
  };

  const fetchByStatus = async (status: StatusAmbulancia) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ambulanciasService.getByStatus(status);
      setAmbulancias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar ambulâncias');
    } finally {
      setLoading(false);
    }
  };

  const fetchByTipo = async (tipo: TipoAmbulancia) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ambulanciasService.getByTipo(tipo);
      setAmbulancias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar ambulâncias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbulancias();
  }, []);

  return {
    ambulancias,
    loading,
    error,
    refetch: fetchAmbulancias,
    fetchProntas,
    fetchByStatus,
    fetchByTipo
  };
}

/**
 * Hook para uma ambulância específica
 */
export function useAmbulancia(id?: number) {
  const [ambulancia, setAmbulancia] = useState<Ambulancia | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAmbulancia = async (ambulanciaId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ambulanciasService.getById(ambulanciaId);
      setAmbulancia(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar ambulância');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAmbulancia(id);
    }
  }, [id]);

  return {
    ambulancia,
    loading,
    error,
    refetch: id ? () => fetchAmbulancia(id) : undefined
  };
}
