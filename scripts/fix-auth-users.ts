/**
 * Script para resetar senha dos usuários no Supabase Auth
 * Deleta e recria os usuários com senha correta
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

const testUsers = [
  { email: 'medico@teste.com', password: 'senha123' },
  { email: 'enfermeiro@teste.com', password: 'senha123' },
  { email: 'motorista@teste.com', password: 'senha123' },
  { email: 'chefemedicos@teste.com', password: 'senha123' },
  { email: 'chefeenfermeiros@teste.com', password: 'senha123' },
  { email: 'chefeambulancia@teste.com', password: 'senha123' },
];

async function fixAuthUsers() {
  console.log('🔧 Corrigindo usuários no Supabase Auth...\n');

  // 1. Listar todos os usuários
  console.log('📋 Listando usuários existentes...');
  const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    console.error('❌ Erro ao listar usuários:', listError);
    return;
  }

  console.log(`   Encontrados: ${existingUsers.users.length} usuários\n`);

  // 2. Deletar usuários de teste existentes
  for (const user of existingUsers.users) {
    if (testUsers.some(tu => tu.email === user.email)) {
      console.log(`🗑️  Deletando usuário existente: ${user.email}`);
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

      if (deleteError) {
        console.error(`   ❌ Erro ao deletar: ${deleteError.message}`);
      } else {
        console.log(`   ✅ Deletado`);
      }
    }
  }

  console.log('\n⏳ Aguardando 2 segundos...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 3. Recriar usuários com senha correta
  console.log('🔑 Recriando usuários com senha correta...\n');

  for (const user of testUsers) {
    console.log(`📧 Criando: ${user.email}`);

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        email_verified: true
      }
    });

    if (error) {
      console.error(`   ❌ Erro: ${error.message}`);
    } else {
      console.log(`   ✅ Criado! (ID: ${data.user?.id})`);
      console.log(`   📧 Email confirmado: ${data.user?.email_confirmed_at ? 'Sim' : 'Não'}`);
    }
  }

  console.log('\n✨ Processo concluído!');
  console.log('\n🔐 Credenciais para teste:');
  console.log('   Email: medico@teste.com');
  console.log('   Senha: senha123\n');
}

fixAuthUsers().catch(console.error);
