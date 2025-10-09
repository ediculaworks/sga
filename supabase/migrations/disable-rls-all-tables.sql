-- ============================================================================
-- SOLUÇÃO TEMPORÁRIA: Desabilitar RLS em todas as tabelas do sistema
-- ============================================================================
-- Este script desabilita RLS temporariamente para permitir desenvolvimento
-- Em produção, RLS deve ser reabilitado com políticas corretas
-- ============================================================================

-- Desabilitar RLS em todas as tabelas principais (apenas se existirem)
ALTER TABLE IF EXISTS usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS motoristas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS escala DISABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS ambulancias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS equipamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS estoque_ambulancias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gastos DISABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS ocorrencias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ocorrencias_participantes DISABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS pacientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS atendimentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notas_atendimento DISABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS notificacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rastreamento_ambulancias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS logs_sistema DISABLE ROW LEVEL SECURITY;

-- Conceder todas as permissões nas sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Conceder todas as permissões nas tabelas
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;

-- ============================================================================
-- RESULTADO ESPERADO:
-- - Todas as operações CRUD devem funcionar sem erros 400/403
-- - Criação de ocorrências deve funcionar completamente
-- - Dashboard deve carregar sem erros
-- ============================================================================

-- ============================================================================
-- IMPORTANTE: Este é um modo de desenvolvimento
-- Para produção, use políticas RLS específicas por perfil
-- ============================================================================
