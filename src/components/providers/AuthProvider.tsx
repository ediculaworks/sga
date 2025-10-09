'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
 * CORREÇÃO v0.18.11:
 * - NÃO escuta eventos durante o login para evitar race conditions
 * - Página de login gerencia seu próprio estado
 *
 * NOTA: A partir da v0.18.10, não há mais "inicialização assíncrona" do estado.
 * O middleware já garante que apenas usuários autenticados acessem rotas protegidas.
 */

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname();
  const setUser = useAuthStore((state) => state.setUser);

  // Verificar se estamos na página de login
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    // NÃO escutar eventos na página de login
    // O login gerencia seu próprio estado para evitar race conditions
    if (isLoginPage) {
      console.log('[AuthProvider] Página de login detectada - listeners desativados');
      return;
    }

    // Listener de mudanças no estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthProvider] Auth state changed:', event);

      if (event === 'SIGNED_OUT') {
        // Limpar usuário do store ao fazer logout
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED') {
        // Atualizar dados do usuário quando refresh de token
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
      // REMOVIDO: Evento SIGNED_IN
      // A página de login já gerencia isso diretamente
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
  }, [isLoginPage, setUser]);

  return <>{children}</>;
}
