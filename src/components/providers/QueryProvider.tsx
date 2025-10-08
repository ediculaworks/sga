'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

/**
 * Provider do React Query
 *
 * Configura o QueryClient para gerenciar cache de dados do servidor.
 *
 * CORREÇÕES:
 * - Revalida queries após inatividade
 * - Detecta focus da janela para atualizar dados
 * - Cache otimizado para Safari/Mac
 * - Tempos de cache aumentados (5min stale, 15min gc)
 * - Detecta inatividade de 5 minutos e invalida queries
 * - Revalida ao voltar para a tab após 2 minutos
 */

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tempo de cache: 5 minutos (dados considerados frescos)
            staleTime: 1000 * 60 * 5,
            // Tempo antes de remover do cache: 15 minutos
            gcTime: 1000 * 60 * 15,
            // Retry em caso de erro
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // CORREÇÃO: Revalidar quando ganhar foco (após inatividade)
            refetchOnWindowFocus: true,
            // Revalidar ao reconectar à internet
            refetchOnReconnect: true,
            // Revalidar queries que estão sendo observadas ao montar
            refetchOnMount: true,
          },
        },
      })
  );

  // CORREÇÃO: Detectar inatividade prolongada e limpar cache
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    let lastActivity = Date.now();

    const resetInactivityTimer = () => {
      lastActivity = Date.now();
      clearTimeout(inactivityTimer);

      // Após 5 minutos de inatividade, invalidar todas as queries
      inactivityTimer = setTimeout(() => {
        const now = Date.now();
        const inactiveDuration = now - lastActivity;

        // Se ficou inativo por mais de 5 minutos, invalidar cache
        if (inactiveDuration >= 1000 * 60 * 5) {
          console.log('[QueryProvider] Inatividade detectada, invalidando queries');
          queryClient.invalidateQueries();
        }
      }, 1000 * 60 * 5); // 5 minutos
    };

    // Eventos que resetam o timer de inatividade
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => {
      document.addEventListener(event, resetInactivityTimer);
    });

    // Listener para visibilitychange (tab ativa/inativa)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        const inactiveDuration = now - lastActivity;

        // Se a tab ficou inativa por mais de 2 minutos, invalidar queries
        if (inactiveDuration >= 1000 * 60 * 2) {
          console.log('[QueryProvider] Tab ativa após inatividade, revalidando queries');
          queryClient.invalidateQueries();
        }

        lastActivity = now;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Inicializar timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      clearTimeout(inactivityTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetInactivityTimer);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
