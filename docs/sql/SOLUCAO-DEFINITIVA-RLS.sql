-- ==========================================
-- SOLUÇÃO DEFINITIVA PARA O PROBLEMA DE RLS
-- ==========================================
-- Execute este script COMPLETO no SQL Editor do Supabase
-- ==========================================

-- OPÇÃO 1: DESABILITAR RLS (mais simples, menos seguro)
-- Descomente as 2 linhas abaixo se quiser desabilitar RLS completamente
-- ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
-- -- Fim da Opção 1

-- OPÇÃO 2: MANTER RLS MAS CONFIGURAR CORRETAMENTE (recomendado)
-- Execute todo o código abaixo:

-- Passo 1: Remover TODAS as políticas existentes
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'usuarios'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON usuarios';
    END LOOP;
END $$;

-- Passo 2: Garantir que RLS está habilitado
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Passo 3: Criar política PERMISSIVA para SELECT
-- Esta política permite que QUALQUER UM (authenticated e anon) leia a tabela
CREATE POLICY "usuarios_select_policy"
ON usuarios
FOR SELECT
TO public
USING (true);

-- Passo 4: Criar política para INSERT (apenas chefes)
CREATE POLICY "usuarios_insert_policy"
ON usuarios
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE email = auth.jwt() ->> 'email'
    AND tipo_perfil IN ('CHEFE_MEDICOS', 'CHEFE_ENFERMEIROS', 'CHEFE_AMBULANCIAS')
  )
);

-- Passo 5: Criar política para UPDATE (usuários podem atualizar seus próprios dados)
CREATE POLICY "usuarios_update_policy"
ON usuarios
FOR UPDATE
TO authenticated
USING (email = auth.jwt() ->> 'email')
WITH CHECK (email = auth.jwt() ->> 'email');

-- Passo 6: Criar política para DELETE (apenas chefes)
CREATE POLICY "usuarios_delete_policy"
ON usuarios
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE email = auth.jwt() ->> 'email'
    AND tipo_perfil IN ('CHEFE_MEDICOS', 'CHEFE_ENFERMEIROS', 'CHEFE_AMBULANCIAS')
  )
);

-- ==========================================
-- VERIFICAÇÃO FINAL
-- ==========================================

-- Ver todas as políticas criadas
SELECT
  policyname,
  roles,
  cmd,
  permissive,
  qual::text as using_clause,
  with_check::text as check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'usuarios'
ORDER BY cmd;

-- Testar se consegue ler a tabela
SELECT id, nome_completo, email, tipo_perfil, ativo
FROM usuarios
LIMIT 5;
