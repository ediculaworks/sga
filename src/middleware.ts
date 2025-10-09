import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Middleware de Autenticação
 *
 * Verifica autenticação e permissões antes de cada requisição.
 * Redireciona usuários não autenticados ou sem permissão.
 *
 * NOVA ABORDAGEM: Middleware ao invés de ProtectedRoute
 * - Mais performático (sem re-renders)
 * - Recomendado pelo Next.js 14
 * - Evita loops infinitos
 */

// Rotas públicas (não precisam de autenticação)
const PUBLIC_ROUTES = ['/login', '/setup'];

// Mapa de rotas e perfis permitidos
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/medico': ['MEDICO'],
  '/enfermeiro': ['ENFERMEIRO'],
  '/motorista': ['MOTORISTA'],
  '/chefe-medicos': ['CHEFE_MEDICOS'],
  '/chefe-enfermeiros': ['CHEFE_ENFERMEIROS'],
  '/chefe-ambulancias': ['CHEFE_AMBULANCIAS'],
};

// Dashboard padrão por perfil
const DASHBOARD_BY_PROFILE: Record<string, string> = {
  MEDICO: '/medico',
  ENFERMEIRO: '/enfermeiro',
  MOTORISTA: '/motorista',
  CHEFE_MEDICOS: '/chefe-medicos',
  CHEFE_ENFERMEIROS: '/chefe-enfermeiros',
  CHEFE_AMBULANCIAS: '/chefe-ambulancias',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rotas públicas
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Permitir assets estáticos e API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Criar response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Criar cliente Supabase com SSR
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Verificar sessão
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Log detalhado para debug no Vercel
  console.log('[Middleware] Pathname:', pathname);
  console.log('[Middleware] Session exists:', !!session);
  console.log('[Middleware] Session user email:', session?.user?.email || 'none');
  console.log('[Middleware] Cookies:', request.cookies.getAll().map(c => c.name).join(', '));

  // Se não estiver autenticado, redirecionar para login
  if (!session) {
    console.log('[Middleware] Sem sessão, redirecionando para /login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Buscar dados do usuário do localStorage (cache)
  // Se não houver, buscar do banco
  const { data: userData, error } = await supabase
    .from('usuarios')
    .select('tipo_perfil')
    .eq('email', session.user.email)
    .single();

  console.log('[Middleware] User data:', userData);
  console.log('[Middleware] User data error:', error);

  if (error || !userData) {
    console.error('[Middleware] Erro ao buscar usuário:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const userProfile = userData.tipo_perfil;
  console.log('[Middleware] User profile:', userProfile);

  // Verificar permissões para a rota
  for (const [routePrefix, allowedProfiles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(routePrefix)) {
      if (!allowedProfiles.includes(userProfile)) {
        // Usuário não tem permissão, redirecionar para seu dashboard
        const userDashboard = DASHBOARD_BY_PROFILE[userProfile] || '/login';
        return NextResponse.redirect(new URL(userDashboard, request.url));
      }
      // Tem permissão, continuar
      return response;
    }
  }

  // Rota raiz, redirecionar para dashboard do usuário
  if (pathname === '/') {
    const userDashboard = DASHBOARD_BY_PROFILE[userProfile] || '/login';
    return NextResponse.redirect(new URL(userDashboard, request.url));
  }

  // Outras rotas, permitir
  return response;
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
