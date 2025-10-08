# 🌳 ESTRATÉGIA DE BRANCHES - SGA

**Data de Criação:** 08 de Outubro de 2025
**Repositório:** https://github.com/ediculaworks/sga

---

## 📋 VISÃO GERAL

Este documento define a estratégia de branches do projeto SGA para garantir desenvolvimento organizado, testes seguros e deploys controlados.

---

## 🌿 ESTRUTURA DE BRANCHES

### **main** (Produção)
- **Propósito:** Código em produção, estável e testado
- **Proteção:** ⚠️ NUNCA commitar diretamente
- **Deploy:** Automático para produção (Vercel)
- **Merge permitido de:** `staging` (via Pull Request aprovado)

### **staging** (Homologação/Testes)
- **Propósito:** Ambiente de testes antes de ir para produção
- **Uso:** Validação final, testes de integração, revisão do cliente
- **Deploy:** Ambiente de staging (preview do Vercel)
- **Merge permitido de:** `dev` (via Pull Request)
- **Merge para:** `main` (após aprovação)

### **dev** (Desenvolvimento)
- **Propósito:** Branch principal de desenvolvimento
- **Uso:** Todo desenvolvimento de novas features
- **Commits:** Commits frequentes durante implementação
- **Merge permitido de:** Feature branches (se criadas)
- **Merge para:** `staging` (via Pull Request)

---

## 🔄 FLUXO DE TRABALHO

### Desenvolvimento Normal

```
1. Trabalhar na branch dev
   └─ git checkout dev

2. Fazer commits frequentes
   └─ git add .
   └─ git commit -m "Descrição"
   └─ git push origin dev

3. Quando feature estiver completa e testada:
   └─ Criar PR: dev → staging

4. Testar em staging

5. Se aprovado, criar PR: staging → main
```

### Fluxo Completo

```
dev → staging → main
 │       │        │
 │       │        └── Produção (Vercel)
 │       └────────── Testes/Homologação
 └────────────────── Desenvolvimento
```

---

## 🎯 QUANDO USAR CADA BRANCH

### Use **dev** quando:
- ✅ Implementar novas features
- ✅ Fazer correções de bugs
- ✅ Refatorar código
- ✅ Adicionar componentes
- ✅ Desenvolvimento do dia a dia

### Use **staging** quando:
- ✅ Validar features completas
- ✅ Testar integrações
- ✅ Revisar antes de produção
- ✅ Demo para cliente/stakeholders

### Use **main** quando:
- ✅ Deploy em produção aprovado
- ✅ Release de versão estável
- ⚠️ **APENAS via Pull Request de staging**

---

## 📝 COMANDOS ÚTEIS

### Trocar de branch
```bash
git checkout dev      # Ir para dev
git checkout staging  # Ir para staging
git checkout main     # Ir para main
```

### Verificar branch atual
```bash
git branch            # Listar branches locais
git branch -a         # Listar todas (locais + remotas)
```

### Atualizar branch local com remote
```bash
git pull origin dev
```

### Criar Pull Request (via GitHub CLI)
```bash
# De dev para staging
gh pr create --base staging --head dev --title "Feature XYZ" --body "Descrição"

# De staging para main
gh pr create --base main --head staging --title "Release v0.X.0" --body "Changelog"
```

---

## 🚀 PROCESSO DE MERGE

### Dev → Staging

1. **Pré-requisitos:**
   - ✅ Features testadas localmente
   - ✅ Build funcionando (`npm run build`)
   - ✅ Sem erros no console
   - ✅ CHANGELOG.md atualizado

2. **Criar Pull Request:**
   ```bash
   gh pr create --base staging --head dev \
     --title "Merge dev → staging: Features X, Y, Z" \
     --body "## Mudanças\n- Feature X\n- Feature Y\n- Bug fix Z"
   ```

3. **Revisão:**
   - Revisar código no GitHub
   - Testar em ambiente de staging
   - Aprovar PR

4. **Merge:**
   ```bash
   gh pr merge <PR_NUMBER> --squash
   ```

### Staging → Main

1. **Pré-requisitos:**
   - ✅ Testado completamente em staging
   - ✅ Aprovação do cliente/stakeholder
   - ✅ Sem bugs críticos
   - ✅ CHANGELOG.md com versão atualizada

2. **Criar Pull Request:**
   ```bash
   gh pr create --base main --head staging \
     --title "Release v0.X.0" \
     --body "$(cat CHANGELOG.md | head -50)"
   ```

3. **Revisão Final:**
   - Última verificação
   - Confirmar versão no CHANGELOG
   - Aprovar PR

4. **Merge e Deploy:**
   ```bash
   gh pr merge <PR_NUMBER> --merge
   ```
   - Deploy automático para produção (Vercel)

---

## 🔐 REGRAS DE PROTEÇÃO

### Branch main
- ❌ Não permitir commits diretos
- ✅ Exigir Pull Request
- ✅ Exigir revisão de código
- ✅ Exigir status checks passando

### Branch staging
- ⚠️ Permitir commits diretos (apenas para hotfixes urgentes)
- ✅ Preferir Pull Requests de dev

### Branch dev
- ✅ Commits diretos permitidos
- ✅ Push frequente recomendado

---

## 🐛 HOTFIXES URGENTES

Se um bug crítico aparecer em produção:

```bash
# 1. Criar branch de hotfix a partir de main
git checkout main
git pull origin main
git checkout -b hotfix/nome-do-bug

# 2. Corrigir o bug
# ... fazer correções ...

# 3. Commit e push
git add .
git commit -m "hotfix: Corrigir bug crítico X"
git push origin hotfix/nome-do-bug

# 4. Criar PR direto para main
gh pr create --base main --head hotfix/nome-do-bug \
  --title "HOTFIX: Bug crítico X" \
  --body "Correção urgente de bug em produção"

# 5. Após merge, sincronizar com staging e dev
git checkout staging
git merge main
git push origin staging

git checkout dev
git merge main
git push origin dev
```

---

## 📊 STATUS ATUAL

### Branches Criadas
- ✅ `main` - Produção
- ✅ `staging` - Homologação
- ✅ `dev` - Desenvolvimento

### Branch Ativa
- 🔵 `dev` - Você está aqui

### Próximos Passos
1. Trabalhar na branch `dev`
2. Fazer commits frequentes
3. Quando pronto, solicitar merge para `staging`
4. Após testes, solicitar merge para `main`

---

## 🎓 BOAS PRÁTICAS

### Commits
- ✅ Frequentes e pequenos
- ✅ Mensagens descritivas
- ✅ Um propósito por commit
- ✅ Incluir prefixos: `feat:`, `fix:`, `refactor:`, `docs:`

### Pull Requests
- ✅ Título claro e objetivo
- ✅ Descrição detalhada das mudanças
- ✅ Listar features/bugs corrigidos
- ✅ Screenshots se houver UI
- ✅ Mencionar breaking changes

### Testes
- ✅ Testar localmente antes de push
- ✅ Testar em staging antes de main
- ✅ Verificar build: `npm run build`
- ✅ Verificar lint: `npm run lint`

---

## 📞 COMANDOS CLAUDE CODE

Quando trabalhar com Claude Code, use estas instruções:

### Trabalhar em dev
```
"Faça commit das mudanças na branch dev"
"Faça push para dev"
```

### Preparar para staging
```
"Crie um Pull Request de dev para staging"
"As features X, Y e Z estão prontas para staging"
```

### Preparar para produção
```
"Crie um Pull Request de staging para main"
"Aprovar release v0.X.0 para produção"
```

### Fazer merge
```
"Faça merge do PR #X de staging para main"
"Aprove e faça merge do PR"
```

---

## 🔍 VERIFICAÇÃO RÁPIDA

### Onde estou?
```bash
git branch  # Branch com * é a atual
```

### O que mudou?
```bash
git status  # Ver arquivos modificados
git diff    # Ver diferenças
```

### Histórico recente
```bash
git log --oneline -10  # Últimos 10 commits
```

---

## 📚 REFERÊNCIAS

- [Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Semantic Versioning](https://semver.org/)

---

**Última atualização:** 08 de Outubro de 2025
**Versão do documento:** 1.0
