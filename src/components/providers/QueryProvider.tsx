'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Provider do React Query
 *
 * Configura o QueryClient para gerenciar cache de dados do servidor.
 */

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tempo de cache padrão: 5 minutos
            staleTime: 1000 * 60 * 5,
            // Tempo antes de remover do cache: 10 minutos
            gcTime: 1000 * 60 * 10,
            // Retry em caso de erro
            retry: 1,
            // Refetch quando a janela ganhar foco
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
