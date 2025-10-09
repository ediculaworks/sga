'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { TipoPerfil } from '@/types';
import { redirectToDashboard } from '@/lib/utils/redirect';

/**
 * Componente de Rota Protegida
 *
 * Protege rotas baseado em perfis de usuário.
 * Se o usuário não tiver permissão, redireciona para seu dashboard ou login.
 *
 * @example
 * ```tsx
 * <ProtectedRoute allowedProfiles={['MEDICO', 'ENFERMEIRO']}>
 *   <ConteudoProtegido />
 * </ProtectedRoute>
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
  const { user, isLoading, isInitialized, hasPermission } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Memoizar o cálculo de permissão para evitar re-renderizações
  const userHasPermission = useMemo(
    () => hasPermission(allowedProfiles),
    [user?.tipo_perfil, allowedProfiles]
  );

  // Timeout de segurança: se ficar mais de 5 segundos carregando, redirecionar para login
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isInitialized || isLoading) {
        console.warn('[ProtectedRoute] Loading timeout - redirecting to login');
        setLoadingTimeout(true);
        router.push('/login');
      }
    }, 5000); // 5 segundos

    return () => clearTimeout(timeout);
  }, [isInitialized, isLoading, router]);

  useEffect(() => {
    // Aguardar inicialização
    if (!isInitialized || isLoading) {
      return;
    }

    // Se não estiver autenticado, redirecionar para login
    if (!user) {
      router.push('/login');
      return;
    }

    // Se não tiver permissão, redirecionar
    if (!userHasPermission) {
      if (fallbackRoute) {
        router.push(fallbackRoute);
      } else {
        // Redirecionar para o dashboard correto do usuário
        redirectToDashboard(user.tipo_perfil, router);
      }
    }
  }, [user, isLoading, isInitialized, userHasPermission, fallbackRoute, router]);

  // Mostrar loading enquanto verifica
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Verificando permissões...</p>
          {loadingTimeout && (
            <p className="mt-2 text-sm text-orange-600">
              Tempo limite excedido. Redirecionando...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, não renderizar nada (redirecionamento acontecerá)
  if (!user) {
    return null;
  }

  // Se não tiver permissão, não renderizar nada (redirecionamento acontecerá)
  if (!userHasPermission) {
    return null;
  }

  // Renderizar conteúdo protegido
  return <>{children}</>;
}
