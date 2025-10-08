import { useAuthStore } from '@/stores/authStore';
import { TipoPerfil } from '@/types';

/**
 * Hook de Autenticação
 *
 * Fornece acesso fácil aos dados de autenticação e funções de controle de acesso.
 *
 * @example
 * ```tsx
 * const { user, isLoading, hasPermission } = useAuth();
 *
 * if (hasPermission(['MEDICO', 'ENFERMEIRO'])) {
 *   // Renderizar conteúdo
 * }
 * ```
 */
export function useAuth() {
  const { user, isLoading, isInitialized, login, logout } = useAuthStore();

  /**
   * Verifica se o usuário tem permissão baseado em uma lista de perfis permitidos
   *
   * @param allowedProfiles - Array de perfis permitidos
   * @returns true se o usuário tem permissão, false caso contrário
   */
  const hasPermission = (allowedProfiles: TipoPerfil[]): boolean => {
    if (!user) return false;
    return allowedProfiles.includes(user.tipo_perfil);
  };

  /**
   * Retorna o tipo de perfil do usuário atual
   */
  const userProfile = user?.tipo_perfil || null;

  /**
   * Verifica se o usuário está autenticado
   */
  const isAuthenticated = !!user;

  return {
    // Estados
    user,
    isLoading,
    isInitialized,
    isAuthenticated,
    userProfile,

    // Funções
    login,
    logout,
    hasPermission,
  };
}
