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
 */

interface AuthState {
  user: Usuario | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: Usuario | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,

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

        // CORREÇÃO: Resetar isInitialized ao fazer logout
        set({ user: null, isLoading: false, isInitialized: false });
      },

      /**
       * Inicializa o estado de autenticação
       * Verifica se há uma sessão ativa e carrega os dados do usuário
       */
      initializeAuth: async () => {
        const state = get();

        // Se já foi inicializado, não fazer nada
        if (state.isInitialized) {
          console.log('[authStore] Already initialized, skipping...');
          return;
        }

        // Se já tem usuário persistido, apenas marcar como inicializado
        if (state.user) {
          console.log('[authStore] User found in storage, marking as initialized');
          set({ isInitialized: true });
          return;
        }

        // Caso contrário, buscar sessão atual do Supabase
        console.log('[authStore] No user in storage, fetching from Supabase...');
        set({ isLoading: true });

        const { user } = await authService.getCurrentUser();

        set({ user, isLoading: false, isInitialized: true });

        // NOTA: O listener de auth state change está no AuthProvider
        // Removido daqui para evitar duplicação e loops infinitos
      },
    }),
    {
      name: 'auth-storage', // Nome da chave no localStorage
      partialize: (state) => ({ user: state.user }), // Apenas persiste o usuário
    }
  )
);
