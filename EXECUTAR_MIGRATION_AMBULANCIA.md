# ⚡ Instruções Rápidas: Migration de Tipos de Ambulância

## 🎯 Execute em 2 Passos

### 📝 PASSO 1: Adicionar Novos Valores ao Enum

Abra o Supabase SQL Editor e execute:

```sql
-- ============================================================================
-- PARTE 1: Adicionar Novos Valores ao ENUM tipo_ambulancia
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
```

**✅ Aguarde a confirmação de sucesso antes de continuar!**

---

### 📝 PASSO 2: Migrar os Dados

**⚠️ SÓ EXECUTE APÓS O PASSO 1 CONCLUIR COM SUCESSO!**

Abra uma **NOVA query** no Supabase SQL Editor e execute:

```sql
-- ============================================================================
-- PARTE 2: Migrar Dados para Novos Valores de tipo_ambulancia
-- ============================================================================

-- Atualizar OCORRENCIAS
UPDATE ocorrencias
SET tipo_ambulancia = 'UTI'
WHERE tipo_ambulancia = 'EMERGENCIA';

UPDATE ocorrencias
SET tipo_ambulancia = 'USB'
WHERE tipo_ambulancia = 'BASICA';

-- Atualizar AMBULANCIAS
UPDATE ambulancias
SET tipo_atual = 'UTI'
WHERE tipo_atual = 'EMERGENCIA';

UPDATE ambulancias
SET tipo_atual = 'USB'
WHERE tipo_atual = 'BASICA';

-- Atualizar EQUIPAMENTOS_CATALOGO
UPDATE equipamentos_catalogo
SET tipo_ambulancia = 'UTI'
WHERE tipo_ambulancia = 'EMERGENCIA';

UPDATE equipamentos_catalogo
SET tipo_ambulancia = 'USB'
WHERE tipo_ambulancia = 'BASICA';

-- Atualizar CHECKLIST_EQUIPAMENTOS_AMBULANCIA
UPDATE checklist_equipamentos_ambulancia
SET tipo_definido = 'UTI'
WHERE tipo_definido = 'EMERGENCIA';

UPDATE checklist_equipamentos_ambulancia
SET tipo_definido = 'USB'
WHERE tipo_definido = 'BASICA';

-- Adicionar comentários
COMMENT ON COLUMN ocorrencias.tipo_ambulancia IS
'Tipo de ambulância necessária para esta ocorrência.
Determinado automaticamente:
- UTI: Se há médico na equipe de profissionais
- USB: Se não há médico na equipe (apenas enfermeiros)';
```

**✅ Migration concluída!**

---

## 🧪 Verificar Sucesso

Execute esta query para verificar que os valores foram atualizados:

```sql
-- Verificar valores do enum
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'tipo_ambulancia'::regtype
ORDER BY enumsortorder;

-- Verificar dados em ocorrencias
SELECT tipo_ambulancia, COUNT(*)
FROM ocorrencias
GROUP BY tipo_ambulancia;
```

**Resultado esperado:**
- Enum deve ter 4 valores: BASICA, EMERGENCIA, USB, UTI
- Dados devem mostrar apenas USB e UTI (nenhum BASICA ou EMERGENCIA)

---

## ❓ Por que 2 passos?

PostgreSQL exige que novos valores de enum sejam **commitados em uma transação separada** antes de poderem ser usados. Por isso, é necessário executar em 2 etapas.

---

## 📚 Documentação Completa

Para mais detalhes, consulte: `MIGRATION_TESTING_GUIDE.md`
