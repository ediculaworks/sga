/**
 * Hook customizado para usar o cliente Supabase
 *
 * Este hook facilita o uso do Supabase em componentes React,
 * fornecendo acesso ao cliente e funções utilitárias comuns.
 */

import { supabase } from '@/lib/supabase/client';

export function useSupabase() {
  return {
    supabase,
    // Adicione funções utilitárias aqui conforme necessário
  };
}
