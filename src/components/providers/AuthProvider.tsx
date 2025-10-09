'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase/client';

/**
 * AuthProvider Component
 *
 * Provider simplificado que apenas escuta mudanças de autenticação.
 *
 * A validação de autenticação é feita via middleware (server-side).
 * Este provider apenas:
 * - Escuta eventos de logout (SIGNED_OUT)
 * - Atualiza o store quando houver mudanças
 * - Faz refresh automático do token a cada 50 minutos
 *
 * NOTA: A partir da v0.18.10, não há mais "inicialização assíncrona" do estado.
 * O middleware já garante que apenas usuários autenticados acessem rotas protegidas.
 */

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // Listener de mudanças no estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthProvider] Auth state changed:', event);

      if (event === 'SIGNED_OUT') {
        // Limpar usuário do store ao fazer logout
        setUser(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Atualizar dados do usuário quando houver login ou refresh de token
        if (session?.user?.email) {
          const { data: userData } = await supabase
            .from('usuarios')
            .select('*')
            .ilike('email', session.user.email)
            .single();

          if (userData) {
            setUser(userData);
          }
        }
      }
    });

    // Refresh automático de token a cada 50 minutos (token expira em 60min)
    const refreshInterval = setInterval(
      async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          console.log('[AuthProvider] Refreshing session token...');
          const { error } = await supabase.auth.refreshSession();

          if (error) {
            console.error('[AuthProvider] Error refreshing session:', error);
            setUser(null);
          }
        }
      },
      1000 * 60 * 50
    ); // 50 minutos

    // Cleanup
    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [setUser]);

  return <>{children}</>;
}
