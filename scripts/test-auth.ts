/**
 * Script de teste de autenticação
 * Testa se as credenciais funcionam no Supabase Auth
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🔐 Testando autenticação...\n');

  const testEmail = 'medico@teste.com';
  const testPassword = 'senha123';

  console.log(`📧 Email: ${testEmail}`);
  console.log(`🔑 Senha: ${testPassword}\n`);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      console.error('❌ ERRO ao autenticar:');
      console.error(`   Mensagem: ${error.message}`);
      console.error(`   Status: ${error.status}`);
      console.error(`   Nome: ${error.name}\n`);
      console.error('Detalhes completos:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Autenticação FUNCIONOU!');
      console.log(`   User ID: ${data.user?.id}`);
      console.log(`   Email: ${data.user?.email}`);
      console.log(`   Email Confirmado: ${data.user?.email_confirmed_at ? 'Sim' : 'Não'}`);
    }
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
  }
}

testAuth();
