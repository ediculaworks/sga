import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { url, key } = await request.json();

    if (!url || !key) {
      return NextResponse.json(
        { success: false, error: 'URL e chave são obrigatórios' },
        { status: 400 }
      );
    }

    // Tenta criar um cliente Supabase com as credenciais fornecidas
    const supabase = createClient(url, key);

    // Testa a conexão usando uma query de sistema (funciona mesmo sem tabelas)
    const { data, error } = await supabase.rpc('get_database_version');

    // Se não houver a função, tenta outro método
    if (error && error.message.includes('function')) {
      // Testa fazendo uma consulta simples ao auth
      const { data: authData, error: authError } = await supabase.auth.getSession();

      if (authError && authError.message.includes('Invalid')) {
        return NextResponse.json(
          { success: false, error: 'Credenciais inválidas. Verifique a URL e a chave.' },
          { status: 401 }
        );
      }

      // Se chegou aqui, a conexão está OK
      return NextResponse.json({
        success: true,
        message: 'Conexão estabelecida com sucesso! ✅',
        details: 'Cliente Supabase criado e autenticado corretamente.'
      });
    }

    if (error) {
      // Verifica se é erro de autenticação
      if (error.message.includes('Invalid') || error.message.includes('JWT')) {
        return NextResponse.json(
          { success: false, error: 'Chave de API inválida. Verifique a anon/public key.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Conexão estabelecida com sucesso! ✅',
      details: 'Banco de dados online e respondendo.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao testar conexão' },
      { status: 500 }
    );
  }
}
