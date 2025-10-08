import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { TipoPerfil } from '@/types';

/**
 * Middleware de Proteção de Rotas
 *
 * Este middleware protege as rotas do dashboard, verificando:
 * 1. Se o usuário está autenticado
 * 2. Se o usuário tem permissão para acessar a rota (baseado no perfil)
 *
 * Rotas protegidas:
 * - /medico/* - Apenas MEDICO
 * - /enfermeiro/* - Apenas ENFERMEIRO
 * - /motorista/* - Apenas MOTORISTA
 * - /chefe-medicos/* - Apenas CHEFE_MEDICOS
 * - /chefe-enfermeiros/* - Apenas CHEFE_ENFERMEIROS
 * - /chefe-ambulancias/* - Apenas CHEFE_AMBULANCIAS
 */

/**
 * Mapa de rotas para perfis permitidos
 */
const ROUTE_PERMISSIONS: Record<string, TipoPerfil[]> = {
  '/medico': [TipoPerfil.MEDICO],
  '/enfermeiro': [TipoPerfil.ENFERMEIRO],
  '/motorista': [TipoPerfil.MOTORISTA],
  '/chefe-medicos': [TipoPerfil.CHEFE_MEDICOS],
  '/chefe-enfermeiros': [TipoPerfil.CHEFE_ENFERMEIROS],
  '/chefe-ambulancias': [TipoPerfil.CHEFE_AMBULANCIAS],
};

/**
 * Retorna a rota do dashboard baseado no perfil
 */
function getDashboardRoute(perfil: TipoPerfil): string {
  const routes: Record<TipoPerfil, string> = {
    [TipoPerfil.MEDICO]: '/medico',
    [TipoPerfil.ENFERMEIRO]: '/enfermeiro',
    [TipoPerfil.MOTORISTA]: '/motorista',
    [TipoPerfil.CHEFE_MEDICOS]: '/chefe-medicos',
    [TipoPerfil.CHEFE_ENFERMEIROS]: '/chefe-enfermeiros',
    [TipoPerfil.CHEFE_AMBULANCIAS]: '/chefe-ambulancias',
  };
  return routes[perfil] || '/login';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('[MIDDLEWARE] Pathname:', pathname);

  // Lista de rotas protegidas (dashboards)
  const protectedRoutes = Object.keys(ROUTE_PERMISSIONS);

  // Verificar se a rota atual é protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  console.log('[MIDDLEWARE] Is protected route:', isProtectedRoute);

  // Se não for rota protegida, permitir acesso
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    // Criar cliente Supabase usando @supabase/ssr
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Verificar sessão
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    console.log('[MIDDLEWARE] Session:', session ? 'exists' : 'null', 'Error:', error);

    // Se não houver sessão válida, redirecionar para login
    if (error || !session) {
      console.log('[MIDDLEWARE] Sem sessão, redirecionando para login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Buscar dados do usuário para verificar perfil
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('tipo_perfil')
      .eq('email', session.user.email)
      .single();

    console.log('[MIDDLEWARE] User data:', userData, 'Error:', userError);

    if (userError || !userData) {
      console.log('[MIDDLEWARE] Erro ao buscar usuário, redirecionando para login');
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar permissão de acesso baseado no perfil
    const userProfile = userData.tipo_perfil as TipoPerfil;
    const currentRoute = protectedRoutes.find((route) => pathname.startsWith(route));

    console.log('[MIDDLEWARE] User profile:', userProfile, 'Current route:', currentRoute);

    if (currentRoute) {
      const allowedProfiles = ROUTE_PERMISSIONS[currentRoute];

      // Se o usuário não tem permissão, redirecionar para seu dashboard
      if (!allowedProfiles.includes(userProfile)) {
        console.log('[MIDDLEWARE] Sem permissão, redirecionando para dashboard correto');
        const dashboardUrl = new URL(getDashboardRoute(userProfile), request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }

    console.log('[MIDDLEWARE] Permissão OK, permitindo acesso');
    // Sessão válida e permissão OK, permitir acesso
    return response;
  } catch (error) {
    console.error('[MIDDLEWARE] Erro no middleware de autenticação:', error);

    // Em caso de erro, redirecionar para login por segurança
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

/**
 * Configuração do middleware
 * Define em quais rotas o middleware deve ser executado
 */
export const config = {
  matcher: [
    /*
     * TEMPORARIAMENTE DESABILITADO - Ajustando fluxo de autenticação
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    // '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
