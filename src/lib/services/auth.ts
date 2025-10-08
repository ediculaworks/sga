import { supabase } from '@/lib/supabase/client';
import { Usuario } from '@/types';

/**
 * Serviço de Autenticação usando Supabase Auth
 *
 * Este serviço gerencia todas as operações de autenticação:
 * - Login com email/senha
 * - Logout
 * - Obter usuário atual
 * - Gerenciar sessão
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Usuario | null;
  error: string | null;
}

/**
 * Realiza login do usuário
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    // 1. Autenticar com Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError) {
      return {
        user: null,
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        user: null,
        error: 'Erro ao fazer login. Tente novamente.',
      };
    }

    // 2. Buscar dados completos do usuário na tabela usuarios
    console.log('[AUTH] Buscando usuário com email:', credentials.email);

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .ilike('email', credentials.email)
      .single();

    console.log('[AUTH] Resultado da busca:', { userData, userError });

    if (userError || !userData) {
      // Se não encontrar o usuário na tabela, fazer logout do Supabase Auth
      console.error('[AUTH] Usuário não encontrado na tabela usuarios:', userError);
      await supabase.auth.signOut();
      return {
        user: null,
        error: 'Usuário não encontrado no sistema.',
      };
    }

    // 3. Verificar se o usuário está ativo
    if (!userData.ativo) {
      await supabase.auth.signOut();
      return {
        user: null,
        error: 'Usuário inativo. Entre em contato com o administrador.',
      };
    }

    return {
      user: userData as Usuario,
      error: null,
    };
  } catch (error) {
    console.error('Erro no login:', error);
    return {
      user: null,
      error: 'Erro inesperado ao fazer login.',
    };
  }
}

/**
 * Realiza logout do usuário
 */
export async function logout(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Erro no logout:', error);
    return { error: 'Erro ao fazer logout.' };
  }
}

/**
 * Obtém o usuário atualmente autenticado
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    // 1. Verificar sessão do Supabase Auth
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return {
        user: null,
        error: null,
      };
    }

    // 2. Buscar dados completos do usuário
    if (!session.user.email) {
      return {
        user: null,
        error: 'Email não encontrado na sessão.',
      };
    }

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .ilike('email', session.user.email)
      .single();

    if (userError || !userData) {
      // Sessão existe mas usuário não está no banco
      await supabase.auth.signOut();
      return {
        user: null,
        error: 'Usuário não encontrado.',
      };
    }

    // 3. Verificar se está ativo
    if (!userData.ativo) {
      await supabase.auth.signOut();
      return {
        user: null,
        error: 'Usuário inativo.',
      };
    }

    return {
      user: userData as Usuario,
      error: null,
    };
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return {
      user: null,
      error: 'Erro ao verificar autenticação.',
    };
  }
}

/**
 * Obtém a sessão atual do Supabase Auth
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return { session: null, error: error.message };
    }

    return { session, error: null };
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return { session: null, error: 'Erro ao verificar sessão.' };
  }
}

/**
 * Escuta mudanças no estado de autenticação
 */
export function onAuthStateChange(callback: (user: Usuario | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      // Buscar dados completos do usuário
      const { user } = await getCurrentUser();
      callback(user);
    } else if (event === 'SIGNED_OUT') {
      callback(null);
    } else if (event === 'TOKEN_REFRESHED' && session) {
      // Atualizar dados do usuário quando token é renovado
      const { user } = await getCurrentUser();
      callback(user);
    }
  });
}
