import { useState, useEffect } from 'react';
import { ocorrenciasService } from '@/lib/services';
import type { Ocorrencia, OcorrenciaCompleta, StatusOcorrencia, TipoTrabalho } from '@/types';

/**
 * Hook para gerenciar ocorrências
 */
export function useOcorrencias() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOcorrencias = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ocorrenciasService.getAll();
      setOcorrencias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar ocorrências');
    } finally {
      setLoading(false);
    }
  };

  const fetchByStatus = async (status: StatusOcorrencia) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ocorrenciasService.getByStatus(status);
      setOcorrencias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar ocorrências');
    } finally {
      setLoading(false);
    }
  };

  const fetchByData = async (data: string) => {
    try {
      setLoading(true);
      setError(null);
      const ocorrencias = await ocorrenciasService.getByData(data);
      setOcorrencias(ocorrencias);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar ocorrências');
    } finally {
      setLoading(false);
    }
  };

  const fetchByPeriodo = async (dataInicio: string, dataFim: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ocorrenciasService.getByPeriodo(dataInicio, dataFim);
      setOcorrencias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar ocorrências');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOcorrencias();
  }, []);

  return {
    ocorrencias,
    loading,
    error,
    refetch: fetchOcorrencias,
    fetchByStatus,
    fetchByData,
    fetchByPeriodo
  };
}

/**
 * Hook para uma ocorrência específica com dados completos
 */
export function useOcorrencia(id?: number) {
  const [ocorrencia, setOcorrencia] = useState<OcorrenciaCompleta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOcorrencia = async (ocorrenciaId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ocorrenciasService.getById(ocorrenciaId);
      setOcorrencia(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar ocorrência');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOcorrencia(id);
    }
  }, [id]);

  return {
    ocorrencia,
    loading,
    error,
    refetch: id ? () => fetchOcorrencia(id) : undefined
  };
}

/**
 * Hook para ocorrências completas (com joins)
 */
export function useOcorrenciasCompletas() {
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaCompleta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOcorrencias = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ocorrenciasService.getCompletas();
      setOcorrencias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar ocorrências');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOcorrencias();
  }, []);

  return {
    ocorrencias,
    loading,
    error,
    refetch: fetchOcorrencias
  };
}
