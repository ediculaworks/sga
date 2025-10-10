-- ============================================================================
-- REFATORAÇÃO: Renomear Tipos de Ambulância
-- ============================================================================
-- Renomeia os tipos de ambulância para refletir nomenclatura correta:
-- - BASICA → USB (Unidade de Suporte Básico)
-- - EMERGENCIA → UTI (Unidade de Terapia Intensiva)
--
-- NOVA REGRA:
-- O tipo de ambulância é determinado AUTOMATICAMENTE baseado na equipe:
-- - Se há médico na equipe → UTI
-- - Se não há médico → USB
--
-- Isso elimina a necessidade de "equipe mínima" fixa por tipo.
-- ============================================================================

-- PASSO 1: Adicionar novos valores ao ENUM existente (antes de fazer UPDATEs)
-- Isso permite que o enum aceite tanto valores antigos quanto novos durante a transição
ALTER TYPE tipo_ambulancia ADD VALUE IF NOT EXISTS 'USB';
ALTER TYPE tipo_ambulancia ADD VALUE IF NOT EXISTS 'UTI';

-- PASSO 2: Atualizar valores existentes em OCORRENCIAS
UPDATE ocorrencias
SET tipo_ambulancia = 'UTI'
WHERE tipo_ambulancia = 'EMERGENCIA';

UPDATE ocorrencias
SET tipo_ambulancia = 'USB'
WHERE tipo_ambulancia = 'BASICA';

-- PASSO 3: Atualizar valores existentes em AMBULANCIAS
UPDATE ambulancias
SET tipo_atual = 'UTI'
WHERE tipo_atual = 'EMERGENCIA';

UPDATE ambulancias
SET tipo_atual = 'USB'
WHERE tipo_atual = 'BASICA';

-- PASSO 4: Atualizar valores existentes em EQUIPAMENTOS_CATALOGO
UPDATE equipamentos_catalogo
SET tipo_ambulancia = 'UTI'
WHERE tipo_ambulancia = 'EMERGENCIA';

UPDATE equipamentos_catalogo
SET tipo_ambulancia = 'USB'
WHERE tipo_ambulancia = 'BASICA';

-- PASSO 5: Atualizar valores existentes em CHECKLIST_EQUIPAMENTOS_AMBULANCIA
UPDATE checklist_equipamentos_ambulancia
SET tipo_definido = 'UTI'
WHERE tipo_definido = 'EMERGENCIA';

UPDATE checklist_equipamentos_ambulancia
SET tipo_definido = 'USB'
WHERE tipo_definido = 'BASICA';

-- PASSO 6: Adicionar comentários explicativos
-- Nota: Mantemos os valores antigos (BASICA, EMERGENCIA) no enum temporariamente
-- para compatibilidade. Eles podem ser removidos manualmente no futuro se necessário.
COMMENT ON TYPE tipo_ambulancia IS
'Tipos de ambulância no sistema:
- USB: Unidade de Suporte Básico (equipe sem médico)
- UTI: Unidade de Terapia Intensiva (equipe com médico)

REGRA: O tipo é determinado AUTOMATICAMENTE pela presença de médico na equipe.
Não há mais "equipe mínima" fixa por tipo.';

COMMENT ON COLUMN ocorrencias.tipo_ambulancia IS
'Tipo de ambulância necessária para esta ocorrência.
Determinado automaticamente:
- UTI: Se há médico na equipe de profissionais
- USB: Se não há médico na equipe (apenas enfermeiros)';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
-- IMPORTANTE: Após executar esta migration, o sistema deve ser atualizado para:
-- 1. Inferir automaticamente o tipo baseado na equipe de profissionais
-- 2. Remover seleção manual de tipo de ambulância no formulário
-- 3. Exibir o tipo inferido como informação (não editável)
-- ============================================================================
