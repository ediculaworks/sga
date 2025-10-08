/**
 * Script para criar usuários no Supabase Auth
 *
 * Este script cria usuários de teste no Supabase Auth para que possam fazer login
 * IMPORTANTE: Execute este script APENAS UMA VEZ para configuração inicial
 *
 * Como executar:
 * npx tsx scripts/create-auth-users.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente do .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!');
  console.error('   Certifique-se de que .env.local contém:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Cliente admin (usa service role key)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Usuários de teste (senha padrão: senha123)
const testUsers = [
  { email: 'medico@teste.com', password: 'senha123' },
  { email: 'enfermeiro@teste.com', password: 'senha123' },
  { email: 'motorista@teste.com', password: 'senha123' },
  { email: 'chefemedicos@teste.com', password: 'senha123' },
  { email: 'chefeenfermeiros@teste.com', password: 'senha123' },
  { email: 'chefeambulancia@teste.com', password: 'senha123' },
];

async function createAuthUsers() {
  console.log('🚀 Iniciando criação de usuários no Supabase Auth...\n');

  for (const user of testUsers) {
    try {
      console.log(`📧 Criando usuário: ${user.email}`);

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Confirmar email automaticamente
      });

      if (error) {
        // Se o erro for "user already exists", não é um erro crítico
        if (error.message.includes('already registered')) {
          console.log(`   ⚠️  Usuário já existe (OK)`);
        } else {
          console.error(`   ❌ Erro: ${error.message}`);
        }
      } else {
        console.log(`   ✅ Criado com sucesso! (ID: ${data.user?.id})`);
      }
    } catch (error) {
      console.error(`   ❌ Erro inesperado:`, error);
    }
  }

  console.log('\n✨ Processo concluído!\n');
  console.log('📝 Credenciais de teste:');
  console.log('   Email: medico@teste.com | Senha: senha123');
  console.log('   Email: enfermeiro@teste.com | Senha: senha123');
  console.log('   Email: motorista@teste.com | Senha: senha123');
  console.log('   Email: chefemedicos@teste.com | Senha: senha123');
  console.log('   Email: chefeenfermeiros@teste.com | Senha: senha123');
  console.log('   Email: chefeambulancia@teste.com | Senha: senha123\n');
}

createAuthUsers().catch(console.error);
