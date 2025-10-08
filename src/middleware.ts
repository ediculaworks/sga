import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Middleware de Proteção de Rotas
 *
 * Este middleware protege as rotas do dashboard, verificando se o usuário
 * está autenticado. Caso não esteja, redireciona para a página de login.
 *
 * Rotas protegidas:
 * - /medico/*
 * - /enfermeiro/*
 * - /motorista/*
 * - /chefe-medicos/*
 * - /chefe-enfermeiros/*
 * - /chefe-ambulancias/*
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lista de rotas protegidas (dashboards)
  const protectedRoutes = [
    '/medico',
    '/enfermeiro',
    '/motorista',
    '/chefe-medicos',
    '/chefe-enfermeiros',
    '/chefe-ambulancias',
  ];

  // Verificar se a rota atual é protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Se não for rota protegida, permitir acesso
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Criar cliente Supabase para verificar sessão
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const response = NextResponse.next();

  // Obter token de autenticação do cookie
  const token = request.cookies.get('sb-access-token');

  // Se não houver token, redirecionar para login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verificar sessão
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    // Se não houver sessão válida, redirecionar para login
    if (error || !session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Sessão válida, permitir acesso
    return response;
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);

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
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
