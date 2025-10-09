-- ============================================================================
-- DIAGNÓSTICO: Desabilitar RLS temporariamente
-- ============================================================================
-- Este script DESABILITA completamente o RLS nas tabelas problemáticas
-- para confirmar que o erro é realmente de permissão RLS.
--
-- ATENÇÃO: Isto é apenas para TESTE/DIAGNÓSTICO!
-- Depois que confirmar que funciona, vamos reabilitar com políticas corretas.
-- ============================================================================

-- Desabilitar RLS em todas as tabelas envolvidas
ALTER TABLE ocorrencias DISABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencias_participantes DISABLE ROW LEVEL SECURITY;
ALTER TABLE ambulancias DISABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_ambulancias DISABLE ROW LEVEL SECURITY;

-- Conceder permissões nas sequences
GRANT USAGE, SELECT ON SEQUENCE ocorrencias_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE ocorrencias_participantes_id_seq TO authenticated;

-- ============================================================================
-- IMPORTANTE: Após testar e confirmar que funciona, execute o outro script
-- (fix-ocorrencias-permissions.sql) para reabilitar o RLS com as políticas
-- corretas.
-- ============================================================================
