# Solução: Erro "Nenhuma vaga disponível para este perfil"

## Data
2025-10-08

## Problema

Ao tentar confirmar participação em uma ocorrência, o sistema retorna erro:

```
Erro ao confirmar participação: Error: Nenhuma vaga disponível para este perfil
```

**Localização do erro**: `src/lib/services/ocorrencias.ts:282`

## Causa Raiz

O erro ocorre quando **não existem vagas vazias** (`usuario_id = NULL`) na tabela `ocorrencias_participantes` para a ocorrência e perfil específicos.

### Fluxo da Função `confirmarParticipacao`

1. Verifica se o usuário já está participando (linhas 272-305)
2. **Busca vagas vazias** com os seguintes filtros (linhas 308-315):
   - `ocorrencia_id` = ID da ocorrência
   - `funcao` = MEDICO ou ENFERMEIRO
   - `confirmado` = false
   - `usuario_id` IS NULL ← **Aqui está o problema**
3. Se nenhuma vaga for encontrada → lança erro na linha 323

## Possíveis Causas

### 1. Migration não foi executada

O script `scripts/fix-ocorrencias-participantes-schema.sql` NÃO foi executado no Supabase, então:
- A coluna `usuario_id` ainda é NOT NULL
- Não existem vagas vazias (todos os registros têm `usuario_id`)

**Como verificar**: Execute o script de diagnóstico abaixo.

### 2. Vagas não foram criadas

Mesmo que a migration tenha sido executada, pode ser que:
- As ocorrências EM_ABERTO não tenham participantes cadastrados
- Todas as vagas já foram preenchidas

**Como verificar**: Execute a query abaixo.

### 3. Dados de teste inconsistentes

Os dados de seed podem ter criado ocorrências sem participantes.

## Solução

### PASSO 1: Executar Diagnóstico

1. Acesse o Supabase SQL Editor: https://supabase.com/dashboard/project/tclvrcgoxqsimbqtnyia/sql/new
2. Execute o script: `scripts/diagnostico-ocorrencias-participantes.sql`
3. Analise os resultados de cada seção

**O que verificar**:
- **Seção 1**: `usuario_id` deve ser `is_nullable = YES`
- **Seção 3**: Deve existir índice `ocorrencias_participantes_usuario_unico`
- **Seção 6**: Deve haver `vagas_vazias > 0`
- **Seção 7**: Verificar quais ocorrências têm vagas vazias

### PASSO 2: Executar Migration (se necessário)

Se o diagnóstico mostrar que `usuario_id` ainda é NOT NULL:

1. Execute o script: `scripts/fix-ocorrencias-participantes-schema.sql`
2. Aguarde a execução completa
3. Execute o diagnóstico novamente para verificar

### PASSO 3: Criar Vagas de Teste

Se não houver vagas vazias:

1. Identifique uma ocorrência EM_ABERTO (use script de verificação)
2. Execute o script: `scripts/verificar-e-criar-vagas.sql`
3. Descomente e ajuste o INSERT no PASSO 3 com o ID da ocorrência
4. Execute para criar vagas vazias

**Exemplo**:
```sql
-- Criar 2 vagas vazias para ocorrência ID 5
INSERT INTO ocorrencias_participantes (ocorrencia_id, funcao, confirmado, usuario_id)
VALUES
    (5, 'MEDICO', false, NULL),
    (5, 'ENFERMEIRO', false, NULL);
```

### PASSO 4: Testar Novamente

1. Recarregue o Dashboard Médico
2. Clique em uma ocorrência disponível
3. Clique em "Confirmar Participação"
4. Verifique se funciona sem erros

## Scripts Criados

1. **`scripts/diagnostico-ocorrencias-participantes.sql`**
   - Diagnóstico completo do schema
   - Verifica estrutura, constraints, permissões, dados

2. **`scripts/verificar-e-criar-vagas.sql`**
   - Verifica ocorrências EM_ABERTO
   - Lista participantes existentes
   - Template para criar vagas vazias

3. **`scripts/fix-ocorrencias-participantes-schema.sql`** (já existia)
   - Migration para tornar usuario_id NULLABLE
   - Atualiza constraints e permissões

## Checklist de Resolução

- [ ] Executar `diagnostico-ocorrencias-participantes.sql`
- [ ] Verificar se `usuario_id` é NULLABLE
- [ ] Executar `fix-ocorrencias-participantes-schema.sql` (se necessário)
- [ ] Verificar se existem vagas vazias
- [ ] Executar `verificar-e-criar-vagas.sql` (se necessário)
- [ ] Criar vagas vazias para testes
- [ ] Testar confirmação de participação
- [ ] Verificar se status muda para CONFIRMADA

## Próximos Passos

Após resolver o erro:

1. Atualizar `supabase/schema.sql` com as alterações permanentes
2. Criar script de seed que já inclui vagas vazias
3. Adicionar validação no frontend para só mostrar ocorrências com vagas
4. Documentar processo de criação de ocorrências com vagas

## Referências

- Código da função: `src/lib/services/ocorrencias.ts:269-368`
- Migration original: `scripts/fix-ocorrencias-participantes-schema.sql`
- Documentação anterior: `docs/md/CORRECAO_OCORRENCIAS_PARTICIPANTES.md`
- Dashboard médico: `src/app/(dashboard)/medico/page.tsx:57-86`
