-- ==========================================
-- CORREÇÃO FINAL DAS POLÍTICAS RLS
-- ==========================================

-- 1. REMOVER TODAS as políticas existentes da tabela usuarios
DROP POLICY IF EXISTS "Permitir leitura de usuários" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem ler seus próprios dados" ON usuarios;
DROP POLICY IF EXISTS "Usuários autenticados podem ler outros usuários" ON usuarios;
DROP POLICY IF EXISTS "Apenas chefes podem criar usuários" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON usuarios;

-- 2. CRIAR nova política que permite leitura para autenticados e anon
-- A role 'anon' é usada DURANTE o processo de login
CREATE POLICY "Permitir leitura de usuários"
ON usuarios FOR SELECT
TO authenticated, anon
USING (true);

-- 3. Apenas chefes podem criar novos usuários
CREATE POLICY "Apenas chefes podem criar usuários"
ON usuarios FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE email = auth.jwt() ->> 'email'
    AND tipo_perfil IN ('CHEFE_MEDICOS', 'CHEFE_ENFERMEIROS', 'CHEFE_AMBULANCIAS')
  )
);

-- 4. Usuários autenticados podem atualizar seus próprios dados
CREATE POLICY "Usuários podem atualizar seus próprios dados"
ON usuarios FOR UPDATE
TO authenticated
USING (email = auth.jwt() ->> 'email')
WITH CHECK (email = auth.jwt() ->> 'email');

-- ==========================================
-- VERIFICAR SE FUNCIONOU
-- ==========================================

-- Listar todas as políticas da tabela usuarios
SELECT
  policyname,
  roles,
  cmd,
  qual::text as using_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'usuarios';
