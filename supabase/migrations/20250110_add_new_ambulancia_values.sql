-- ============================================================================
-- PARTE 1: Adicionar Novos Valores ao ENUM tipo_ambulancia
-- ============================================================================
-- Esta migration adiciona os novos valores USB e UTI ao enum.
-- IMPORTANTE: Execute esta migration PRIMEIRO e aguarde o commit antes de
-- executar a segunda migration (20250110_migrate_ambulancia_data.sql).
-- ============================================================================

-- Adicionar novos valores ao ENUM existente
ALTER TYPE tipo_ambulancia ADD VALUE IF NOT EXISTS 'USB';
ALTER TYPE tipo_ambulancia ADD VALUE IF NOT EXISTS 'UTI';

-- Adicionar comentários explicativos
COMMENT ON TYPE tipo_ambulancia IS
'Tipos de ambulância no sistema:
- BASICA: (DESCONTINUADO - use USB)
- EMERGENCIA: (DESCONTINUADO - use UTI)
- USB: Unidade de Suporte Básico (equipe sem médico)
- UTI: Unidade de Terapia Intensiva (equipe com médico)

REGRA: O tipo é determinado AUTOMATICAMENTE pela presença de médico na equipe.
Não há mais "equipe mínima" fixa por tipo.';

-- ============================================================================
-- FIM DA MIGRATION PARTE 1
-- ============================================================================
-- PRÓXIMO PASSO: Execute a migration 20250110_migrate_ambulancia_data.sql
-- ============================================================================
