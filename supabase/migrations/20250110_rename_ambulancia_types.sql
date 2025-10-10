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

-- 1. Atualizar valores existentes em OCORRENCIAS
UPDATE ocorrencias
SET tipo_ambulancia = 'UTI'
WHERE tipo_ambulancia = 'EMERGENCIA';

UPDATE ocorrencias
SET tipo_ambulancia = 'USB'
WHERE tipo_ambulancia = 'BASICA';

-- 2. Atualizar valores existentes em AMBULANCIAS
UPDATE ambulancias
SET tipo_atual = 'UTI'
WHERE tipo_atual = 'EMERGENCIA';

UPDATE ambulancias
SET tipo_atual = 'USB'
WHERE tipo_atual = 'BASICA';

-- 3. Atualizar valores existentes em EQUIPAMENTOS_CATALOGO
UPDATE equipamentos_catalogo
SET tipo_ambulancia = 'UTI'
WHERE tipo_ambulancia = 'EMERGENCIA';

UPDATE equipamentos_catalogo
SET tipo_ambulancia = 'USB'
WHERE tipo_ambulancia = 'BASICA';

-- 4. Atualizar valores existentes em CHECKLIST_EQUIPAMENTOS_AMBULANCIA
UPDATE checklist_equipamentos_ambulancia
SET tipo_definido = 'UTI'
WHERE tipo_definido = 'EMERGENCIA';

UPDATE checklist_equipamentos_ambulancia
SET tipo_definido = 'USB'
WHERE tipo_definido = 'BASICA';

-- 5. Atualizar o ENUM tipo_ambulancia_enum
-- Primeiro, criar um novo ENUM com os valores corretos
CREATE TYPE tipo_ambulancia_enum_new AS ENUM ('USB', 'UTI');

-- Alterar as colunas para usar o novo ENUM
-- Precisamos fazer isso temporariamente como TEXT e depois converter

-- OCORRENCIAS
ALTER TABLE ocorrencias
  ALTER COLUMN tipo_ambulancia TYPE TEXT;

ALTER TABLE ocorrencias
  ALTER COLUMN tipo_ambulancia TYPE tipo_ambulancia_enum_new
  USING tipo_ambulancia::tipo_ambulancia_enum_new;

-- AMBULANCIAS
ALTER TABLE ambulancias
  ALTER COLUMN tipo_atual TYPE TEXT;

ALTER TABLE ambulancias
  ALTER COLUMN tipo_atual TYPE tipo_ambulancia_enum_new
  USING tipo_atual::tipo_ambulancia_enum_new;

-- EQUIPAMENTOS_CATALOGO
ALTER TABLE equipamentos_catalogo
  ALTER COLUMN tipo_ambulancia TYPE TEXT;

ALTER TABLE equipamentos_catalogo
  ALTER COLUMN tipo_ambulancia TYPE tipo_ambulancia_enum_new
  USING tipo_ambulancia::tipo_ambulancia_enum_new;

-- CHECKLIST_EQUIPAMENTOS_AMBULANCIA
ALTER TABLE checklist_equipamentos_ambulancia
  ALTER COLUMN tipo_definido TYPE TEXT;

ALTER TABLE checklist_equipamentos_ambulancia
  ALTER COLUMN tipo_definido TYPE tipo_ambulancia_enum_new
  USING tipo_definido::tipo_ambulancia_enum_new;

-- Remover o enum antigo e renomear o novo
DROP TYPE tipo_ambulancia_enum;
ALTER TYPE tipo_ambulancia_enum_new RENAME TO tipo_ambulancia_enum;

-- 6. Adicionar comentários explicativos
COMMENT ON TYPE tipo_ambulancia_enum IS
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
