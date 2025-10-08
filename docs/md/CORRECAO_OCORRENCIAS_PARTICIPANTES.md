# Correção: Erro 400/406 em ocorrencias_participantes

## Data
2025-10-08

## Problema Identificado

Erro ao confirmar participação em ocorrências no Dashboard Médico:

```
GET https://tclvrcgoxqsimbqtnyia.supabase.co/rest/v1/ocorrencias_participantes...
400 (Bad Request)
406 (Not Acceptable)
```

### Causa Raiz

1. **Schema incompatível**: A tabela `ocorrencias_participantes` tinha `usuario_id INTEGER NOT NULL`
2. **Constraint UNIQUE**: `UNIQUE(ocorrencia_id, usuario_id)` impedia NULL em `usuario_id`
3. **Lógica de vagas**: O código tentava buscar vagas vazias com `.is('usuario_id', null)`, mas a coluna era NOT NULL
4. **Erro Supabase**: Queries com filtros NULL em colunas NOT NULL retornam 400/406

## Solução Implementada

### 1. Script de Migração do Schema

**Arquivo**: `scripts/fix-ocorrencias-participantes-schema.sql`

Alterações:
- ✅ Tornou `usuario_id` NULLABLE (permite vagas em aberto)
- ✅ Removeu constraint `UNIQUE(ocorrencia_id, usuario_id)`
- ✅ Criou índice único parcial que permite múltiplas vagas vazias
- ✅ Atualizou políticas RLS para INSERT e UPDATE

```sql
-- Tornar usuario_id NULLABLE
ALTER TABLE ocorrencias_participantes
ALTER COLUMN usuario_id DROP NOT NULL;

-- Criar índice único parcial (permite NULL, mas não duplicatas)
CREATE UNIQUE INDEX ocorrencias_participantes_usuario_unico
ON ocorrencias_participantes(ocorrencia_id, usuario_id)
WHERE usuario_id IS NOT NULL;
```

### 2. Correção da Função `confirmarParticipacao`

**Arquivo**: `src/lib/services/ocorrencias.ts:269`

Melhorias:
- ✅ Usa `.limit(1)` em vez de `.single()` para buscar vagas
- ✅ Verifica se o usuário já está participando
- ✅ Previne confirmações duplicadas
- ✅ Adiciona logs de erro detalhados
- ✅ Usa `maybeSingle()` para queries que podem retornar zero resultados
- ✅ Tratamento de erro mais robusto

```typescript
// Buscar vagas disponíveis (retorna array, não single)
const { data: vagasDisponiveis, error: vagaError } = await supabase
  .from('ocorrencias_participantes')
  .select('id')
  .eq('ocorrencia_id', ocorrenciaId)
  .eq('funcao', funcao)
  .eq('confirmado', false)
  .is('usuario_id', null)
  .limit(1);

// Verificar se há vagas
if (!vagasDisponiveis || vagasDisponiveis.length === 0) {
  throw new Error('Nenhuma vaga disponível para este perfil');
}
```

## Como Aplicar a Correção

### Passo 1: Executar Script no Supabase

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/tclvrcgoxqsimbqtnyia
2. Vá em **SQL Editor**
3. Execute o script: `scripts/fix-ocorrencias-participantes-schema.sql`

### Passo 2: Verificar Permissões

O script já inclui a verificação, mas você pode confirmar:

```sql
-- Verificar estrutura
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'ocorrencias_participantes';

-- Verificar políticas
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'ocorrencias_participantes';
```

### Passo 3: Testar a Confirmação

1. Acesse o Dashboard Médico
2. Clique em uma ocorrência disponível
3. Clique em "Confirmar Participação"
4. Verifique se a confirmação funciona sem erros

## Comportamento Esperado

### Antes
- ❌ Erro 400/406 ao confirmar participação
- ❌ Vagas não podiam ficar vazias (usuario_id NULL)
- ❌ Impossível criar vagas em aberto

### Depois
- ✅ Confirmação de participação funciona
- ✅ Vagas podem ficar vazias até serem preenchidas
- ✅ Múltiplas vagas vazias permitidas
- ✅ Previne duplicatas quando preenchidas
- ✅ Logs detalhados em caso de erro

## Arquivos Modificados

1. `scripts/fix-ocorrencias-participantes-schema.sql` (criado)
2. `src/lib/services/ocorrencias.ts` (modificado)
3. `docs/md/CORRECAO_OCORRENCIAS_PARTICIPANTES.md` (criado)

## Próximos Passos

1. ✅ Executar script de migração no Supabase
2. ⏳ Testar confirmação de participação
3. ⏳ Verificar se o status muda para CONFIRMADA quando todas as vagas são preenchidas
4. ⏳ Atualizar schema.sql principal com as alterações

## Referências

- Schema original: `supabase/schema.sql:266-278`
- Função antes da correção: `src/lib/services/ocorrencias.ts:269-315`
- Dashboard médico: `src/app/(dashboard)/medico/page.tsx:57-86`
