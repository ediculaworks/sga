import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase para uso no lado do cliente (Client Components)
 *
 * IMPORTANTE: Este cliente usa variáveis de ambiente públicas (NEXT_PUBLIC_*)
 * que são expostas ao navegador. Não coloque segredos aqui.
 *
 * Para operações do lado do servidor, use o cliente server.ts
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
