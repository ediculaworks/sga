import { useAuthStore } from '@/stores/authStore';
import { TipoPerfil } from '@/types';

/**
 * Hook de Autenticação
 *
 * Fornece acesso fácil aos dados de autenticação e funções de controle de acesso.
 *
 * NOTA: A partir da v0.18.10, este hook é simplificado pois a autenticação
 * é validada via middleware. Não há mais estados de "inicialização" ou
 * "verificando permissões". O middleware garante que o usuário esteja
 * autenticado antes de renderizar qualquer componente.
 *
 * @example
 * ```tsx
 * const { user, hasPermission } = useAuth();
 *
 * if (hasPermission([TipoPerfil.MEDICO, TipoPerfil.ENFERMEIRO])) {
 *   // Renderizar conteúdo
 * }
 * ```
 */
export function useAuth() {
  const { user, isLoading, login, logout } = useAuthStore();

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
    isLoading, // Apenas para login/logout
    isAuthenticated,
    userProfile,

    // Funções
    login,
    logout,
    hasPermission,
  };
}
