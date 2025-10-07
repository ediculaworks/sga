import { create } from 'zustand';
import { Usuario } from '@/types';

/**
 * Store Zustand para gerenciamento de autenticação
 *
 * Este store mantém o estado global do usuário autenticado
 * e fornece funções para login, logout e verificação de autenticação.
 */

interface AuthState {
  user: Usuario | null;
  isLoading: boolean;
  setUser: (user: Usuario | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null }),
}));
