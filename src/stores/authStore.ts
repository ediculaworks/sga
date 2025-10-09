import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Usuario } from '@/types';
import * as authService from '@/lib/services/auth';

/**
 * Store Zustand para gerenciamento de autenticação
 *
 * Este store mantém o estado global do usuário autenticado
 * e fornece funções para login, logout e verificação de autenticação.
 *
 * Usa persistência para manter o usuário logado entre sessões.
 *
 * NOTA: A partir da v0.18.10, a autenticação é validada via middleware.
 * Este store apenas armazena o estado do usuário (sem inicialização assíncrona).
 */

interface AuthState {
  user: Usuario | null;
  isLoading: boolean;
  setUser: (user: Usuario | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      setUser: (user) => set({ user, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      /**
       * Realiza login do usuário
       */
      login: async (email: string, password: string) => {
        set({ isLoading: true });

        const { user, error } = await authService.login({ email, password });

        if (error) {
          set({ isLoading: false, user: null });
          return { success: false, error };
        }

        set({ user, isLoading: false });
        return { success: true };
      },

      /**
       * Realiza logout do usuário
       */
      logout: async () => {
        set({ isLoading: true });

        await authService.logout();

        set({ user: null, isLoading: false });
      },
    }),
    {
      name: 'auth-storage', // Nome da chave no localStorage
      partialize: (state) => ({ user: state.user }), // Apenas persiste o usuário
    }
  )
);
