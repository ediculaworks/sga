import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase para uso no lado do servidor (Server Components, API Routes)
 *
 * Este cliente pode usar a Service Role Key se necessário para operações administrativas.
 * Por padrão, usa a mesma chave anônima para operações normais.
 *
 * Para operações que requerem privilégios elevados, descomente a linha com SERVICE_ROLE_KEY
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Para operações admin

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Não persistir sessão no servidor
  },
});
