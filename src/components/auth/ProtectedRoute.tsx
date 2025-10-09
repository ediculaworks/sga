'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { TipoPerfil } from '@/types';
import { redirectToDashboard } from '@/lib/utils/redirect';

/**
 * Componente de Rota Protegida
 *
 * ⚠️ DEPRECATED: A partir da v0.18.10, este componente NÃO é mais usado.
 * A autenticação agora é feita via middleware (src/middleware.ts).
 *
 * Este arquivo é mantido apenas para referência ou uso futuro específico.
 * Todas as páginas do dashboard foram migradas para validação via middleware.
 *
 * @deprecated Use middleware para autenticação
 * @example
 * ```tsx
 * // NÃO USE MAIS:
 * <ProtectedRoute allowedProfiles={[TipoPerfil.MEDICO]}>
 *   <ConteudoProtegido />
 * </ProtectedRoute>
 *
 * // AGORA: Apenas retorne o componente diretamente
 * // O middleware já validou a autenticação
 * export default function Page() {
 *   return <ConteudoProtegido />;
 * }
 * ```
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedProfiles: TipoPerfil[];
  fallbackRoute?: string;
}

export function ProtectedRoute({
  children,
  allowedProfiles,
  fallbackRoute,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, hasPermission } = useAuth();

  useEffect(() => {
    // Se não estiver autenticado, redirecionar para login
    if (!user && !isLoading) {
      router.push('/login');
      return;
    }

    // Se não tiver permissão, redirecionar
    if (user && !hasPermission(allowedProfiles)) {
      if (fallbackRoute) {
        router.push(fallbackRoute);
      } else {
        // Redirecionar para o dashboard correto do usuário
        redirectToDashboard(user.tipo_perfil, router);
      }
    }
  }, [user, isLoading, allowedProfiles, fallbackRoute, router, hasPermission]);

  // Mostrar loading apenas durante login/logout
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, não renderizar nada (redirecionamento acontecerá)
  if (!user) {
    return null;
  }

  // Se não tiver permissão, não renderizar nada (redirecionamento acontecerá)
  if (!hasPermission(allowedProfiles)) {
    return null;
  }

  // Renderizar conteúdo protegido
  return <>{children}</>;
}
