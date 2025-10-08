-- ============================================
-- DIAGNÓSTICO: ocorrencias_participantes
-- ============================================
-- Execute este script no Supabase SQL Editor para diagnosticar o problema

-- 1. Verificar estrutura da tabela
SELECT
    '1. ESTRUTURA DA TABELA' as secao,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'ocorrencias_participantes'
ORDER BY ordinal_position;

-- 2. Verificar constraints UNIQUE
SELECT
    '2. CONSTRAINTS UNIQUE' as secao,
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'ocorrencias_participantes'::regclass
  AND contype = 'u';

-- 3. Verificar índices UNIQUE
SELECT
    '3. INDICES UNIQUE' as secao,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'ocorrencias_participantes'
  AND indexdef LIKE '%UNIQUE%';

-- 4. Verificar políticas RLS
SELECT
    '4. POLITICAS RLS' as secao,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies
WHERE tablename = 'ocorrencias_participantes';

-- 5. Verificar permissões GRANT
SELECT
    '5. PERMISSOES GRANT' as secao,
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'ocorrencias_participantes'
  AND grantee IN ('anon', 'authenticated');

-- 6. Verificar dados existentes
SELECT
    '6. DADOS EXISTENTES' as secao,
    COUNT(*) as total_registros,
    COUNT(DISTINCT ocorrencia_id) as total_ocorrencias,
    COUNT(CASE WHEN usuario_id IS NULL THEN 1 END) as vagas_vazias,
    COUNT(CASE WHEN usuario_id IS NOT NULL THEN 1 END) as vagas_preenchidas,
    COUNT(CASE WHEN confirmado = true THEN 1 END) as vagas_confirmadas
FROM ocorrencias_participantes;

-- 7. Verificar vagas por ocorrência
SELECT
    '7. VAGAS POR OCORRENCIA' as secao,
    ocorrencia_id,
    funcao,
    COUNT(*) as total_vagas,
    COUNT(CASE WHEN usuario_id IS NULL THEN 1 END) as vagas_vazias,
    COUNT(CASE WHEN usuario_id IS NOT NULL THEN 1 END) as vagas_preenchidas,
    COUNT(CASE WHEN confirmado = true THEN 1 END) as confirmadas
FROM ocorrencias_participantes
GROUP BY ocorrencia_id, funcao
ORDER BY ocorrencia_id;

-- 8. Verificar se RLS está habilitado
SELECT
    '8. STATUS RLS' as secao,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'ocorrencias_participantes';
