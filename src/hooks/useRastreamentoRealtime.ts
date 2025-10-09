import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

/**
 * Hook para atualização em tempo real do rastreamento de ambulâncias
 * Usa Supabase Realtime para escutar mudanças na tabela rastreamento_ambulancias
 */
export function useRastreamentoRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe no canal de rastreamento
    const channel = supabase
      .channel('rastreamento-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'rastreamento_ambulancias',
        },
        (payload) => {
          console.log('Rastreamento atualizado em tempo real:', payload);

          // Invalidar query para forçar refetch
          queryClient.invalidateQueries({ queryKey: ['ambulancias-ativas'] });
        }
      )
      .subscribe();

    // Cleanup ao desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
