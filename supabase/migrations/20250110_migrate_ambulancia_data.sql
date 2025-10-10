-- ============================================================================
-- PARTE 2: Migrar Dados para Novos Valores de tipo_ambulancia
-- ============================================================================
-- Esta migration atualiza todos os registros existentes de BASICA→USB e EMERGENCIA→UTI.
-- IMPORTANTE: Execute esta migration SOMENTE APÓS a migration
-- 20250110_add_new_ambulancia_values.sql ter sido commitada com sucesso.
-- ============================================================================

-- PASSO 1: Atualizar valores existentes em OCORRENCIAS
UPDATE ocorrencias
SET tipo_ambulancia = 'UTI'
WHERE tipo_ambulancia = 'EMERGENCIA';

UPDATE ocorrencias
SET tipo_ambulancia = 'USB'
WHERE tipo_ambulancia = 'BASICA';

-- PASSO 2: Atualizar valores existentes em AMBULANCIAS
UPDATE ambulancias
SET tipo_atual = 'UTI'
WHERE tipo_atual = 'EMERGENCIA';

UPDATE ambulancias
SET tipo_atual = 'USB'
WHERE tipo_atual = 'BASICA';

-- PASSO 3: Atualizar valores existentes em EQUIPAMENTOS_CATALOGO
UPDATE equipamentos_catalogo
SET tipo_ambulancia = 'UTI'
WHERE tipo_ambulancia = 'EMERGENCIA';

UPDATE equipamentos_catalogo
SET tipo_ambulancia = 'USB'
WHERE tipo_ambulancia = 'BASICA';

-- PASSO 4: Atualizar valores existentes em CHECKLIST_EQUIPAMENTOS_AMBULANCIAS
UPDATE checklist_equipamentos_ambulancias
SET tipo_definido = 'UTI'
WHERE tipo_definido = 'EMERGENCIA';

UPDATE checklist_equipamentos_ambulancias
SET tipo_definido = 'USB'
WHERE tipo_definido = 'BASICA';

-- PASSO 5: Adicionar comentários nas colunas
COMMENT ON COLUMN ocorrencias.tipo_ambulancia IS
'Tipo de ambulância necessária para esta ocorrência.
Determinado automaticamente:
- UTI: Se há médico na equipe de profissionais
- USB: Se não há médico na equipe (apenas enfermeiros)';

-- ============================================================================
-- FIM DA MIGRATION PARTE 2
-- ============================================================================
-- Migração concluída! Todos os dados foram atualizados para os novos valores.
-- ============================================================================
