---
description: Diagnóstico e correção iterativa de erros através de hipóteses ordenadas
---

# Função /teste - Diagnóstico e Correção de Erros

## 🎯 Objetivo

Ajudar a identificar e corrigir erros complexos através de **análise por hipóteses ordenadas**, testando soluções de forma iterativa e controlada.

## 📋 Fluxo de Execução

### 1️⃣ Análise do Erro
- Analisar o erro descrito pelo usuário
- Investigar código relacionado
- Levantar **2 a 5 hipóteses** sobre a causa do erro
- Ordenar hipóteses por **probabilidade de sucesso** (maior → menor)

### 2️⃣ Apresentação das Hipóteses
Apresentar ao usuário:
```
🔍 DIAGNÓSTICO - Erro: [descrição]

📊 HIPÓTESES (ordenadas por probabilidade):

[1] PROBABILIDADE ALTA (80-90%)
    → [Descrição da hipótese 1]
    → [Por que é provável]
    → [Arquivos afetados]

[2] PROBABILIDADE MÉDIA-ALTA (60-70%)
    → [Descrição da hipótese 2]
    → [Por que é provável]
    → [Arquivos afetados]

[...continuar até hipótese N...]

🔧 PLANO DE AÇÃO:
- Criar branch "teste1" e implementar hipótese 1
- Aguardar teste do usuário
- Se não resolver, criar "teste2" com hipótese 2
- Repetir até resolver ou esgotar hipóteses
- Fazer merge da branch que funcionou
- Deletar branches que não funcionaram

✅ Posso começar com a hipótese 1?
```

**AGUARDAR CONFIRMAÇÃO DO USUÁRIO ("ok" ou similar)**

### 3️⃣ Implementação Iterativa

#### Para cada hipótese (N = 1, 2, 3, 4, 5):

**Criar Branch:**
```bash
git checkout dev
git pull origin dev
git checkout -b testeN
```

**Implementar Correção:**
- Aplicar correção conforme hipótese N
- Seguir padrões do projeto (REGRAS.md)
- Fazer commit descritivo
- Fazer push da branch

**Avisar Usuário:**
```
✅ Hipótese N implementada na branch "testeN"

🔧 Correções aplicadas:
- [Lista de mudanças]

📁 Arquivos modificados:
- [Lista de arquivos]

🧪 POR FAVOR, TESTE SE O ERRO FOI CORRIGIDO.

Aguardando seu feedback...
```

**AGUARDAR RESPOSTA DO USUÁRIO**

### 4️⃣ Avaliação do Resultado

#### ⚠️ Se usuário reportar ERROS DE BUILD/COMPILAÇÃO da hipótese atual:
```
⚠️ ERROS DE BUILD DETECTADOS

Erros reportados:
[Listar erros do usuário]

🔧 CORREÇÃO IMEDIATA:
- Corrigir erros na branch testeN atual
- NÃO criar nova branch (ainda é hipótese N)
- Fazer commit de correção
- Fazer push
- Solicitar novo teste

⚠️ IMPORTANTE:
Estes são erros DERIVADOS da hipótese N, não falha da hipótese.
Após corrigir, continuamos testando a MESMA hipótese N.
```

**Ações:**
1. Analisar e corrigir erros de build
2. Commit: `fix: Corrigir erros de build da hipótese N`
3. Push na mesma branch testeN
4. Solicitar novo teste ao usuário
5. **NÃO avançar para hipótese N+1 ainda**

#### ✅ Se usuário responder "CORRIGIDO" ou "FUNCIONOU":
```bash
# Fazer merge com dev
git checkout dev
git merge testeN
git push origin dev

# Deletar branches de teste que não funcionaram
git branch -D teste1 teste2 ... (exceto testeN)
git push origin --delete teste1 teste2 ... (se existirem remotas)
```

Avisar:
```
✅ ERRO CORRIGIDO!

🎉 Hipótese N estava correta!

✓ Merge realizado: testeN → dev
✓ Branches de teste anteriores deletadas
✓ Código em produção na branch dev

📝 Não esqueça de atualizar o CHANGELOG.md!
```

**ATUALIZAR CHANGELOG.md** com a correção

#### ❌ Se usuário responder "NÃO CORRIGIDO" ou "NÃO FUNCIONOU":
```
❌ Hipótese N não resolveu o problema.

➡️ Partindo para hipótese N+1...
```

**Voltar ao passo 3️⃣ com N+1**

### 5️⃣ Se Todas as Hipóteses Falharem

```
⚠️ Todas as hipóteses testadas não resolveram o problema.

📊 Hipóteses testadas:
1. [Hipótese 1] - Não resolveu
2. [Hipótese 2] - Não resolveu
...

🔍 ANÁLISE MAIS PROFUNDA NECESSÁRIA:

Possíveis próximos passos:
1. Investigar logs detalhados do sistema
2. Verificar console do navegador (F12)
3. Analisar Network tab para requests falhando
4. Verificar banco de dados diretamente
5. Executar debugger no código

📋 Informações que ajudariam:
- [Lista de informações adicionais necessárias]

🧹 Limpeza:
- Deletar todas as branches teste1-testeN? [Aguardar confirmação]
```

## 🚨 Regras Importantes

1. **SEMPRE aguardar confirmação** antes de criar primeira branch
2. **SEMPRE aguardar feedback** após cada implementação
3. **NÃO criar próxima branch** antes de testar a atual
4. **Apenas UMA branch teste** deve existir por vez
5. **Commits descritivos** em cada branch teste
6. **Seguir REGRAS.md** em todas as implementações
7. **Atualizar CHANGELOG.md** quando corrigir o erro
8. **Deletar branches** que não funcionaram (limpeza)

## 📝 Exemplo de Uso

```
Usuário: /teste O dashboard demora muito para carregar

Claude:
🔍 DIAGNÓSTICO - Erro: Dashboard com carregamento lento

📊 HIPÓTESES (ordenadas por probabilidade):

[1] PROBABILIDADE ALTA (85%)
    → Queries React Query sem debounce ou cache inadequado
    → useMedicoStats e useOcorrenciasDisponiveis executando múltiplas vezes
    → Arquivos: src/hooks/useMedicoStats.ts, useOcorrenciasDisponiveis.ts

[2] PROBABILIDADE MÉDIA-ALTA (70%)
    → Re-renders infinitos causados por dependências mal configuradas
    → useCallback/useMemo ausentes em handlers
    → Arquivos: src/app/(dashboard)/medico/page.tsx

[3] PROBABILIDADE MÉDIA (50%)
    → Timeout de queries muito curto
    → RLS policies do Supabase lentas
    → Arquivos: src/lib/supabase/client.ts, migrations/

✅ Posso começar com a hipótese 1?

[Aguarda "ok" do usuário]
```

## ⚡ Comandos Git Utilizados

```bash
# Criar branch teste
git checkout dev
git pull origin dev
git checkout -b testeN

# Após implementação
git add .
git commit -m "test: Implementar hipótese N - [descrição]"
git push -u origin testeN

# Se funcionou (merge)
git checkout dev
git merge testeN
git push origin dev
git branch -D teste1 teste2 ... (exceto testeN)

# Se não funcionou (próxima hipótese)
git checkout dev
git checkout -b testeN+1
```

---

**🎯 Pronto para usar! Digite `/teste [descrição do erro]` quando precisar.**
