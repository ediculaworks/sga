'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase/client';

/**
 * AuthProvider Component
 *
 * Provider que inicializa o estado de autenticação quando o app carrega.
 * Verifica se há uma sessão ativa e carrega os dados do usuário.
 *
 * CORREÇÕES:
 * - Refresh automático de sessão a cada 50 minutos
 * - Listener de eventos de autenticação
 * - Detecta expiração de sessão
 *
 * Este componente deve ser usado no layout raiz da aplicação.
 */

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // Inicializar autenticação quando o app carrega
    console.log('[AuthProvider] Initializing authentication...');
    initializeAuth();

    // CORREÇÃO: Listener de mudanças no estado de autenticação
    // Removido fetching de dados do usuário para evitar loops
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthProvider] Auth state changed:', event);

      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('[AuthProvider] Token refreshed successfully');
        // Não fazer nada - usuário já está no store
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('[AuthProvider] Password recovery initiated');
      }
    });

    // CORREÇÃO: Refresh automático a cada 50 minutos (token expira em 60min)
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
            // Se falhar o refresh, fazer logout
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
  }, []); // CORREÇÃO: Remover dependências para evitar re-renders

  return <>{children}</>;
}
