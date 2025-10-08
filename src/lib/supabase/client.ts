import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase para uso no lado do cliente (Client Components)
 *
 * IMPORTANTE: Este cliente usa variáveis de ambiente públicas (NEXT_PUBLIC_*)
 * que são expostas ao navegador. Não coloque segredos aqui.
 *
 * Para operações do lado do servidor, use o cliente server.ts
 *
 * CORREÇÕES:
 * - Configuração otimizada para Safari/Mac
 * - Refresh automático de sessão
 * - Persistência melhorada
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configurações otimizadas para Safari e Mac
    autoRefreshToken: true, // Refresh automático do token
    persistSession: true, // Manter sessão entre reloads
    detectSessionInUrl: true, // Detectar sessão na URL
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sga-auth-token', // Chave customizada
    // Reduzir tempo de detecção de sessão inválida
    flowType: 'pkce', // Mais seguro e compatível com Safari
  },
  global: {
    headers: {
      'x-application-name': 'sga',
    },
  },
  // Configuração de network para Safari
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});
