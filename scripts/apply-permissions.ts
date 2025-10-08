/**
 * Script para aplicar permissões usando o Supabase Management API
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function executeSQL(sql: string) {
  const url = `${supabaseUrl}/rest/v1/rpc/exec_sql`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  return response;
}

async function applyPermissions() {
  console.log('🔧 Aplicando permissões via Supabase REST API...\n');

  const sqlStatements = `
-- Conceder permissões básicas
GRANT SELECT ON usuarios TO anon, authenticated;
GRANT INSERT, UPDATE ON usuarios TO authenticated;

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem ler seus próprios dados" ON usuarios;
DROP POLICY IF EXISTS "Usuários autenticados podem ler dados" ON usuarios;
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON usuarios;
DROP POLICY IF EXISTS "Permitir atualização próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "usuarios_select_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_own" ON usuarios;

-- Criar novas políticas
CREATE POLICY "usuarios_select_own" ON usuarios
    FOR SELECT
    TO authenticated
    USING (email = auth.jwt()->>'email');

CREATE POLICY "usuarios_update_own" ON usuarios
    FOR UPDATE
    TO authenticated
    USING (email = auth.jwt()->>'email')
    WITH CHECK (email = auth.jwt()->>'email');
  `;

  console.log('📝 SQL a ser executado:');
  console.log('─'.repeat(60));
  console.log(sqlStatements);
  console.log('─'.repeat(60));
  console.log('\n❌ ERRO: O Supabase JS não permite executar SQL DDL diretamente.\n');
  console.log('📋 INSTRUÇÕES MANUAIS:\n');
  console.log('1. Acesse: https://supabase.com/dashboard/project/tclvrcgoxqsimbqtnyla/sql/new');
  console.log('2. Cole o SQL acima');
  console.log('3. Clique em RUN\n');
  console.log('Ou copie o arquivo: scripts/fix-permissions.sql e execute no SQL Editor\n');
}

applyPermissions().catch(console.error);
