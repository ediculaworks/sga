-- ============================================
-- CORREÇÃO DE PERMISSÕES - OCORRÊNCIAS
-- ============================================
-- Permite que usuários autenticados vejam ocorrências

-- ====================
-- TABELA: ocorrencias
-- ====================

-- 1. Conceder permissões básicas
GRANT SELECT ON ocorrencias TO anon, authenticated;
GRANT INSERT, UPDATE ON ocorrencias TO authenticated;

-- 2. Habilitar RLS
ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas
DROP POLICY IF EXISTS "ocorrencias_select_all" ON ocorrencias;
DROP POLICY IF EXISTS "Permitir leitura de ocorrências" ON ocorrencias;

-- 4. Criar política: usuários autenticados podem ver todas as ocorrências
CREATE POLICY "ocorrencias_select_all" ON ocorrencias
    FOR SELECT
    TO authenticated
    USING (true);

-- ====================
-- TABELA: ocorrencias_participantes
-- ====================

-- 1. Conceder permissões básicas
GRANT SELECT ON ocorrencias_participantes TO anon, authenticated;
GRANT INSERT, UPDATE ON ocorrencias_participantes TO authenticated;

-- 2. Habilitar RLS
ALTER TABLE ocorrencias_participantes ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas
DROP POLICY IF EXISTS "participantes_select_all" ON ocorrencias_participantes;
DROP POLICY IF EXISTS "Permitir leitura de participantes" ON ocorrencias_participantes;

-- 4. Criar política: usuários autenticados podem ver todos os participantes
CREATE POLICY "participantes_select_all" ON ocorrencias_participantes
    FOR SELECT
    TO authenticated
    USING (true);

-- ====================
-- TABELA: escala
-- ====================

-- 1. Conceder permissões básicas
GRANT SELECT ON escala TO anon, authenticated;
GRANT INSERT, UPDATE ON escala TO authenticated;

-- 2. Habilitar RLS
ALTER TABLE escala ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas
DROP POLICY IF EXISTS "escala_select_all" ON escala;
DROP POLICY IF EXISTS "Permitir leitura de escala" ON escala;

-- 4. Criar política: usuários autenticados podem ver toda a escala
CREATE POLICY "escala_select_all" ON escala
    FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar RLS habilitado
SELECT
    tablename,
    rowsecurity as "RLS Habilitado"
FROM pg_tables
WHERE tablename IN ('ocorrencias', 'ocorrencias_participantes', 'escala')
ORDER BY tablename;

-- Verificar políticas criadas
SELECT
    tablename,
    policyname,
    cmd as "Comando"
FROM pg_policies
WHERE tablename IN ('ocorrencias', 'ocorrencias_participantes', 'escala')
ORDER BY tablename, policyname;

-- Verificar permissões
SELECT
    table_name,
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('ocorrencias', 'ocorrencias_participantes', 'escala')
ORDER BY table_name, grantee;
