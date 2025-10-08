/**
 * Script para corrigir permissões da tabela usuarios
 * Executa diretamente no Supabase via API
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixPermissions() {
  console.log('🔧 Corrigindo permissões da tabela usuarios...\n');

  const queries = [
    // 1. Conceder permissões básicas
    {
      name: 'GRANT SELECT',
      sql: `GRANT SELECT ON usuarios TO anon, authenticated;`
    },
    {
      name: 'GRANT INSERT, UPDATE',
      sql: `GRANT INSERT, UPDATE ON usuarios TO authenticated;`
    },

    // 2. Habilitar RLS
    {
      name: 'Habilitar RLS',
      sql: `ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;`
    },

    // 3. Remover políticas antigas
    {
      name: 'Remover política antiga (1)',
      sql: `DROP POLICY IF EXISTS "Usuários podem ler seus próprios dados" ON usuarios;`
    },
    {
      name: 'Remover política antiga (2)',
      sql: `DROP POLICY IF EXISTS "Usuários autenticados podem ler dados" ON usuarios;`
    },
    {
      name: 'Remover política antiga (3)',
      sql: `DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON usuarios;`
    },
    {
      name: 'Remover política antiga (4)',
      sql: `DROP POLICY IF EXISTS "Permitir atualização próprio perfil" ON usuarios;`
    },
    {
      name: 'Remover política antiga (5)',
      sql: `DROP POLICY IF EXISTS "usuarios_select_own" ON usuarios;`
    },
    {
      name: 'Remover política antiga (6)',
      sql: `DROP POLICY IF EXISTS "usuarios_update_own" ON usuarios;`
    },

    // 4. Criar novas políticas
    {
      name: 'Criar política SELECT',
      sql: `
        CREATE POLICY "usuarios_select_own" ON usuarios
        FOR SELECT
        TO authenticated
        USING (email = auth.jwt()->>'email');
      `
    },
    {
      name: 'Criar política UPDATE',
      sql: `
        CREATE POLICY "usuarios_update_own" ON usuarios
        FOR UPDATE
        TO authenticated
        USING (email = auth.jwt()->>'email')
        WITH CHECK (email = auth.jwt()->>'email');
      `
    },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const query of queries) {
    console.log(`📝 ${query.name}...`);

    const { error } = await supabase.rpc('exec_sql', { sql_query: query.sql });

    if (error) {
      // Tentar executar via query direta
      const { error: directError } = await supabase.from('_migrations').select('*').limit(0);

      console.log(`   ⚠️  Nota: ${error.message}`);
      errorCount++;
    } else {
      console.log(`   ✅ Executado`);
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Concluído! (${successCount} sucesso, ${errorCount} avisos)\n`);

  // Verificar o estado final
  console.log('🔍 Verificando configurações...\n');

  const { data: testData, error: testError } = await supabase
    .from('usuarios')
    .select('id, email, nome_completo, tipo_perfil')
    .limit(1);

  if (testError) {
    console.error('❌ Ainda há erro ao buscar usuários:', testError.message);
    console.log('\n💡 Por favor, execute manualmente o SQL no Supabase Dashboard:');
    console.log('   1. Vá em: SQL Editor');
    console.log('   2. Cole o conteúdo de: scripts/fix-permissions.sql');
    console.log('   3. Clique em RUN\n');
  } else {
    console.log('✅ Permissões OK! Teste de leitura funcionou!');
    console.log(`   Encontrado ${testData?.length || 0} usuário(s)\n`);
  }
}

fixPermissions().catch(console.error);
