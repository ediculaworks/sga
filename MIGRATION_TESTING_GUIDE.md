# Guia de Teste: Migration de Tipos de Ambulância

## 📋 Resumo da Migration

**Arquivos:**
- `supabase/migrations/20250110_add_new_ambulancia_values.sql` (PARTE 1)
- `supabase/migrations/20250110_migrate_ambulancia_data.sql` (PARTE 2)

**Objetivo:** Renomear tipos de ambulância e implementar inferência automática baseada na equipe.

**⚠️ IMPORTANTE:** A migration foi dividida em 2 partes devido a uma limitação do PostgreSQL que exige que novos valores de enum sejam commitados antes de serem usados.

### Mudanças:
- `BASICA` → `USB` (Unidade de Suporte Básico)
- `EMERGENCIA` → `UTI` (Unidade de Terapia Intensiva)

### Nova Regra:
- **UTI:** Equipe COM médico
- **USB:** Equipe SEM médico (apenas enfermeiros)

## 🔧 Como Executar a Migration

### ⚠️ ATENÇÃO: Execute em DUAS ETAPAS!

### Passo 1: Executar PARTE 1 - Adicionar Novos Valores ao Enum

1. Abra o dashboard do Supabase
2. Navegue para **SQL Editor**
3. Clique em **New Query**
4. Copie o conteúdo completo de `supabase/migrations/20250110_add_new_ambulancia_values.sql`
5. Cole no editor SQL
6. Clique em **Run** ou pressione `Ctrl+Enter`
7. **✅ Aguarde a confirmação de sucesso**

### Passo 2: Executar PARTE 2 - Migrar os Dados

**⚠️ SÓ EXECUTE APÓS O PASSO 1 TER SIDO COMPLETADO COM SUCESSO!**

1. **Abra uma NOVA query** no SQL Editor
2. Copie o conteúdo completo de `supabase/migrations/20250110_migrate_ambulancia_data.sql`
3. Cole no editor SQL
4. Clique em **Run** ou pressione `Ctrl+Enter`
5. **✅ Aguarde a confirmação de sucesso**

### Por que duas migrations?

PostgreSQL exige que novos valores de enum sejam **commitados em uma transação separada** antes de poderem ser usados. Por isso, dividimos a migration em:
- **Parte 1:** Adiciona os valores USB e UTI ao enum
- **Parte 2:** Atualiza todos os registros existentes

## ✅ Testes Após Migration

### 1. Verificar Valores do ENUM
```sql
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'tipo_ambulancia'::regtype
ORDER BY enumsortorder;
```

**Resultado esperado:**
- BASICA (valor antigo, mantido)
- EMERGENCIA (valor antigo, mantido)
- USB (novo)
- UTI (novo)

### 2. Verificar Dados em OCORRENCIAS
```sql
SELECT tipo_ambulancia, COUNT(*)
FROM ocorrencias
GROUP BY tipo_ambulancia;
```

**Resultado esperado:**
- Todos os registros devem estar com `USB` ou `UTI`
- Nenhum registro com `BASICA` ou `EMERGENCIA`

### 3. Verificar Dados em AMBULANCIAS
```sql
SELECT tipo_atual, COUNT(*)
FROM ambulancias
GROUP BY tipo_atual;
```

**Resultado esperado:**
- Todos os registros devem estar com `USB` ou `UTI`

### 4. Verificar Dados em EQUIPAMENTOS_CATALOGO
```sql
SELECT tipo_ambulancia, COUNT(*)
FROM equipamentos_catalogo
GROUP BY tipo_ambulancia;
```

### 5. Verificar Dados em CHECKLIST_EQUIPAMENTOS_AMBULANCIA
```sql
SELECT tipo_definido, COUNT(*)
FROM checklist_equipamentos_ambulancia
GROUP BY tipo_definido;
```

## 🧪 Teste Funcional no Sistema

### Criar Nova Ocorrência

1. **Acesse:** Central de Despacho → Criar Ocorrência

2. **Teste 1: Equipe COM Médico**
   - Adicione 1 médico à equipe
   - **Resultado esperado:** Sistema exibe "UTI (Unidade de Terapia Intensiva) - Equipe com médico"

3. **Teste 2: Equipe SEM Médico**
   - Adicione apenas enfermeiros
   - **Resultado esperado:** Sistema exibe "USB (Unidade de Suporte Básico) - Equipe sem médico"

4. **Teste 3: Criar Ocorrência**
   - Preencha todos os campos
   - Clique em "Criar Ocorrência"
   - **Resultado esperado:** Ocorrência criada com sucesso, tipo inferido automaticamente

### Visualizar Ocorrência Existente

1. **Acesse:** Dashboard → Ver Detalhes de qualquer ocorrência antiga
2. **Resultado esperado:**
   - Tipo de ambulância exibe "UTI" ou "USB"
   - Badge com cor correta (verde para USB, vermelho para UTI)

## 🚨 Possíveis Erros e Soluções

### Erro: "enum value already exists"
**Causa:** Migration já foi executada anteriormente
**Solução:** Isso é seguro, a migration usa `IF NOT EXISTS`

### Erro: "unsafe use of new value of enum type"
**Causa:** Tentando usar novos valores do enum na mesma transação em que foram criados
**Solução:** Execute as migrations em 2 partes separadas (PARTE 1, depois PARTE 2)

### Erro: "type tipo_ambulancia_enum does not exist"
**Causa:** Nome incorreto do enum (correto é `tipo_ambulancia` sem `_enum`)
**Solução:** Use as migrations corretas fornecidas neste guia

### Erro: "invalid input value for enum"
**Causa:** Tentando usar UTI/USB antes de adicionar ao enum
**Solução:** Execute PARTE 1 primeiro, depois PARTE 2

### Erro: "column does not exist"
**Causa:** Tabela não existe ou nome está errado
**Solução:** Verifique schema do banco de dados

## 📝 Notas Importantes

1. **Valores Antigos:** Os valores `BASICA` e `EMERGENCIA` permanecem no enum para compatibilidade, mas não devem ser usados em novos registros.

2. **Inferência Automática:** O sistema agora determina o tipo automaticamente. Não é mais possível selecionar manualmente o tipo de ambulância.

3. **Código Atualizado:** Todo o código TypeScript já foi atualizado para usar `USB` e `UTI`.

4. **Compatibilidade Temporária:** O código mantém compatibilidade com valores antigos em `styles.ts` para exibição de registros antigos (caso existam antes da migration).

## 📚 Referências

- **Commits:**
  - `044e588` - Primeira versão da migration (single file - descartada)
  - `588e800` - Correção do nome do enum (tipo_ambulancia)
  - `[PRÓXIMO]` - Migration em 2 partes para resolver erro de enum
- **Versão:** v0.20.0
- **Branch:** dev
- **Arquivos:**
  - `20250110_add_new_ambulancia_values.sql` - PARTE 1
  - `20250110_migrate_ambulancia_data.sql` - PARTE 2
  - `20250110_rename_ambulancia_types.sql.backup` - Versão antiga (backup)
- **Documentação:** CHANGELOG.md, REFATORACAO_ALOCACAO_PROFISSIONAIS.md
