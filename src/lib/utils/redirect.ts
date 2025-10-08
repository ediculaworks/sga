import { TipoPerfil } from '@/types';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Mapa de rotas de dashboard por perfil
 */
const DASHBOARD_ROUTES: Record<TipoPerfil, string> = {
  MEDICO: '/medico',
  ENFERMEIRO: '/enfermeiro',
  MOTORISTA: '/motorista',
  CHEFE_MEDICOS: '/chefe-medicos',
  CHEFE_ENFERMEIROS: '/chefe-enfermeiros',
  CHEFE_AMBULANCIAS: '/chefe-ambulancias',
};

/**
 * Redireciona o usuário para o dashboard apropriado baseado no seu perfil
 *
 * @param perfil - Tipo de perfil do usuário
 * @param router - Instância do router do Next.js
 *
 * @example
 * ```tsx
 * const router = useRouter();
 * redirectToDashboard('MEDICO', router);
 * ```
 */
export function redirectToDashboard(
  perfil: TipoPerfil,
  router: AppRouterInstance
): void {
  const route = DASHBOARD_ROUTES[perfil];

  if (!route) {
    console.error(`Rota não encontrada para o perfil: ${perfil}`);
    router.push('/login');
    return;
  }

  router.push(route);
}

/**
 * Retorna a rota do dashboard para um perfil específico
 *
 * @param perfil - Tipo de perfil do usuário
 * @returns Caminho da rota do dashboard
 */
export function getDashboardRoute(perfil: TipoPerfil): string {
  return DASHBOARD_ROUTES[perfil] || '/login';
}

/**
 * Verifica se uma rota é permitida para um perfil específico
 *
 * @param perfil - Tipo de perfil do usuário
 * @param route - Rota a ser verificada
 * @returns true se a rota é permitida, false caso contrário
 */
export function isRouteAllowedForProfile(
  perfil: TipoPerfil,
  route: string
): boolean {
  const dashboardRoute = DASHBOARD_ROUTES[perfil];
  return route.startsWith(dashboardRoute);
}
