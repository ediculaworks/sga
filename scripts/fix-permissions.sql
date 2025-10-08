-- ============================================
-- CORREÇÃO DE PERMISSÕES - TABELA USUARIOS
-- ============================================
-- Este script corrige permissões para permitir
-- que usuários autenticados leiam seus próprios dados

-- 1. Conceder permissões básicas para roles anon e authenticated
GRANT SELECT ON usuarios TO anon, authenticated;
GRANT INSERT, UPDATE ON usuarios TO authenticated;

-- 2. Habilitar RLS (Row Level Security) na tabela usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Usuários podem ler seus próprios dados" ON usuarios;
DROP POLICY IF EXISTS "Usuários autenticados podem ler dados" ON usuarios;
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON usuarios;
DROP POLICY IF EXISTS "Permitir atualização próprio perfil" ON usuarios;

-- 4. Criar políticas RLS corretas
-- Política para leitura: usuários autenticados podem ler seus próprios dados
CREATE POLICY "usuarios_select_own" ON usuarios
    FOR SELECT
    TO authenticated
    USING (email = auth.jwt()->>'email');

-- Política para atualização: usuários podem atualizar seus próprios dados
CREATE POLICY "usuarios_update_own" ON usuarios
    FOR UPDATE
    TO authenticated
    USING (email = auth.jwt()->>'email')
    WITH CHECK (email = auth.jwt()->>'email');

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se RLS está habilitado
SELECT
    schemaname,
    tablename,
    rowsecurity as "RLS Habilitado"
FROM pg_tables
WHERE tablename = 'usuarios';

-- Verificar políticas criadas
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'usuarios';

-- Verificar permissões da tabela
SELECT
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'usuarios';
