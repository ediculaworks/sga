/**
 * Cliente Supabase para uso no navegador (Client Components)
 *
 * CORREÇÃO v0.18.13: Usar cookies ao invés de localStorage
 *
 * O middleware do Next.js precisa ler cookies para validar a sessão.
 * localStorage não é acessível no servidor, causando loop de redirecionamento.
 *
 * Usa @supabase/ssr para gerenciar cookies automaticamente.
 */

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

/**
 * Cliente Supabase configurado para usar cookies via @supabase/ssr
 *
 * Os cookies são automaticamente gerenciados e compartilhados entre:
 * - Client Components (navegador)
 * - Server Components (Next.js)
 * - Middleware (validação de autenticação)
 *
 * IMPORTANTE: Isso substitui a configuração anterior que usava localStorage.
 * Cookies são necessários para o middleware funcionar corretamente no Vercel.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
