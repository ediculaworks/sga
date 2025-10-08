/**
 * Script para resetar senha do usuário medico@teste.com
 * Define a senha como "senha123"
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPassword() {
  console.log('🔐 Resetando senha do usuário medico@teste.com...\n');

  // 1. Buscar o usuário pelo email
  console.log('1️⃣  Buscando usuário...');
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    console.error('   ❌ Erro ao listar usuários:', listError.message);
    return;
  }

  const medico = users.users.find(u => u.email === 'medico@teste.com');

  if (!medico) {
    console.error('   ❌ Usuário medico@teste.com não encontrado!');
    console.log('\n💡 Execute o script fix-auth-users.ts primeiro para criar os usuários.\n');
    return;
  }

  console.log('   ✅ Usuário encontrado!');
  console.log('   ID:', medico.id);
  console.log('   Email:', medico.email);
  console.log('   Confirmado:', medico.email_confirmed_at ? 'Sim' : 'Não');
  console.log('');

  // 2. Atualizar a senha
  console.log('2️⃣  Atualizando senha para "senha123"...');

  const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    medico.id,
    { password: 'senha123' }
  );

  if (updateError) {
    console.error('   ❌ Erro ao atualizar senha:', updateError.message);
    return;
  }

  console.log('   ✅ Senha atualizada com sucesso!');
  console.log('');

  // 3. Garantir que o email está confirmado
  console.log('3️⃣  Verificando confirmação de email...');

  if (!medico.email_confirmed_at) {
    console.log('   ⚠️  Email não confirmado, confirmando...');

    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
      medico.id,
      { email_confirm: true }
    );

    if (confirmError) {
      console.error('   ❌ Erro ao confirmar email:', confirmError.message);
    } else {
      console.log('   ✅ Email confirmado!');
    }
  } else {
    console.log('   ✅ Email já estava confirmado');
  }

  console.log('');
  console.log('═'.repeat(60));
  console.log('✅ SENHA RESETADA COM SUCESSO!\n');
  console.log('🔐 Credenciais atualizadas:');
  console.log('   Email: medico@teste.com');
  console.log('   Senha: senha123');
  console.log('');
  console.log('🌐 Teste agora em: http://localhost:3001/login');
  console.log('═'.repeat(60));
  console.log('');

  // 4. Testar login
  console.log('4️⃣  Testando login...');

  const supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
    email: 'medico@teste.com',
    password: 'senha123',
  });

  if (loginError) {
    console.error('   ❌ FALHA NO LOGIN:', loginError.message);
    console.log('\n   💡 Possíveis causas:');
    console.log('      - Provider de email/senha não habilitado no Supabase Dashboard');
    console.log('      - Restrições de domínio de email configuradas');
    console.log('');
    console.log('   📋 Verificar em:');
    console.log('      https://supabase.com/dashboard/project/tclvrcgoxqsimbqtnyla/auth/providers');
    console.log('');
  } else {
    console.log('   ✅ LOGIN FUNCIONOU!');
    console.log('   User ID:', loginData.user?.id);
    console.log('   Email:', loginData.user?.email);
    console.log('');
    console.log('   🎉 Pode fazer login no navegador agora!');
  }

  console.log('');
}

resetPassword().catch(console.error);
