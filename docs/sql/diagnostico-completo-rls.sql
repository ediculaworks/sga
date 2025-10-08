-- ==========================================
-- DIAGNÓSTICO COMPLETO DO RLS
-- ==========================================

-- 1. Verificar se RLS está habilitado na tabela usuarios
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename = 'usuarios';

-- 2. Listar TODAS as políticas da tabela usuarios
SELECT
  policyname as "Nome da Política",
  roles as "Roles",
  cmd as "Comando",
  qual::text as "USING (condição)",
  with_check::text as "WITH CHECK (condição)"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'usuarios';

-- 3. Verificar se o usuário existe na tabela
SELECT id, nome_completo, email, tipo_perfil, ativo
FROM usuarios
WHERE email = 'medico@teste.com';

-- 4. Verificar se o usuário existe no Auth
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'medico@teste.com';
