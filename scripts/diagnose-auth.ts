/**
 * Script para diagnosticar problemas de autenticação
 * Verifica usuários no Supabase Auth e testa login
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente admin para gerenciar usuários
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Cliente normal para testar login
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseAuth() {
  console.log('🔍 DIAGNÓSTICO DE AUTENTICAÇÃO\n');
  console.log('='.repeat(60) + '\n');

  // 1. Verificar variáveis de ambiente
  console.log('1️⃣  VARIÁVEIS DE AMBIENTE');
  console.log('   URL:', supabaseUrl);
  console.log('   Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '❌ NÃO DEFINIDA');
  console.log('   Service Key:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : '❌ NÃO DEFINIDA');
  console.log('');

  // 2. Listar usuários no Auth
  console.log('2️⃣  USUÁRIOS NO SUPABASE AUTH');
  const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    console.error('   ❌ Erro ao listar usuários:', listError.message);
    return;
  }

  console.log(`   Total de usuários: ${authUsers.users.length}\n`);

  if (authUsers.users.length === 0) {
    console.log('   ⚠️  Nenhum usuário encontrado no Auth!\n');
  } else {
    authUsers.users.forEach((user, index) => {
      console.log(`   [${index + 1}] Email: ${user.email}`);
      console.log(`       ID: ${user.id}`);
      console.log(`       Confirmado: ${user.email_confirmed_at ? '✅ Sim' : '❌ Não'}`);
      console.log(`       Criado em: ${new Date(user.created_at).toLocaleString('pt-BR')}`);
      console.log('');
    });
  }

  // 3. Verificar usuários na tabela usuarios
  console.log('3️⃣  USUÁRIOS NA TABELA USUARIOS');
  const { data: dbUsers, error: dbError } = await supabaseAdmin
    .from('usuarios')
    .select('id, nome_completo, email, tipo_perfil, ativo')
    .limit(10);

  if (dbError) {
    console.error('   ❌ Erro ao buscar usuários:', dbError.message);
  } else {
    console.log(`   Total de usuários: ${dbUsers?.length || 0}\n`);
    dbUsers?.forEach((user, index) => {
      console.log(`   [${index + 1}] ${user.nome_completo}`);
      console.log(`       Email: ${user.email}`);
      console.log(`       Perfil: ${user.tipo_perfil}`);
      console.log(`       Ativo: ${user.ativo ? '✅ Sim' : '❌ Não'}`);
      console.log('');
    });
  }

  // 4. Testar login com medico@teste.com
  console.log('4️⃣  TESTE DE LOGIN');
  console.log('   Tentando login com: medico@teste.com / senha123\n');

  const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
    email: 'medico@teste.com',
    password: 'senha123',
  });

  if (loginError) {
    console.error('   ❌ ERRO NO LOGIN:', loginError.message);
    console.error('   Status:', loginError.status);
    console.error('   Código:', loginError.code);
    console.log('\n   💡 POSSÍVEIS CAUSAS:');
    console.log('      - Usuário não existe no Supabase Auth');
    console.log('      - Senha incorreta');
    console.log('      - Email não confirmado');
    console.log('      - Provider de email/senha não habilitado no Supabase');
  } else {
    console.log('   ✅ LOGIN REALIZADO COM SUCESSO!');
    console.log('   User ID:', loginData.user?.id);
    console.log('   Email:', loginData.user?.email);
    console.log('   Token:', loginData.session?.access_token.substring(0, 30) + '...');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Diagnóstico concluído!\n');
}

diagnoseAuth().catch(console.error);
