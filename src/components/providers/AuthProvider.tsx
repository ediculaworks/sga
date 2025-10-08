'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * AuthProvider Component
 *
 * Provider que inicializa o estado de autenticação quando o app carrega.
 * Verifica se há uma sessão ativa e carrega os dados do usuário.
 *
 * Este componente deve ser usado no layout raiz da aplicação.
 */

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Inicializar autenticação quando o app carrega
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
