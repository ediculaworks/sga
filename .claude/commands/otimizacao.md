# Otimizar Sistema

Execute uma revisão completa de código focada em otimização de performance, redução de bundle size, eliminação de redundâncias e melhoria da experiência do usuário.

## Instruções

Você deve seguir o guia de otimização localizado em `docs/md/otimizacao.md` e realizar:

1. **Análise de Alterações Não Revisadas**
   - Identificar arquivos modificados desde a última revisão
   - Listar componentes, hooks e queries que podem ser otimizados

2. **Aplicar Otimizações Conforme Categorias**
   - React Query (remover refetch desnecessário, combinar queries)
   - Imports (date-fns, lucide-react, bibliotecas)
   - Componentes (memoização, funções inline)
   - Supabase (queries, paginação)
   - Next.js (configurações de build)
   - Bundle size (tree-shaking, code-splitting)

3. **Priorização**
   - **Fase 1** (Alto Impacto): Refetch interval, funções inline, imports
   - **Fase 2** (Médio Impacto): Centralização de utils, memoização
   - **Fase 3** (Longo Prazo): Views no Supabase, code-splitting
   - **Fase 4** (Infraestrutura): Auth cookies, Realtime, CDN

4. **Validação**
   - Testar que as otimizações não quebraram funcionalidades
   - Verificar se há erros de TypeScript
   - Conferir se o build passa sem erros

5. **Documentação**
   - Adicionar registro de otimização no arquivo `docs/md/otimizacao.md`
   - Listar todos os arquivos modificados
   - Documentar impacto estimado das mudanças

## Foco Principal

- ⚡ **Performance**: Sistema mais rápido e leve
- 💾 **Bundle Size**: Reduzir tamanho final do build
- 🔄 **Redundâncias**: Eliminar código duplicado
- 🎯 **Tokens**: Reduzir uso desnecessário de processamento
- 👤 **UX**: Melhor experiência para o usuário

## Checklist de Execução

- [ ] Ler guia completo em `docs/md/otimizacao.md`
- [ ] Identificar arquivos alterados
- [ ] Aplicar otimizações relevantes
- [ ] Mover funções inline para utils
- [ ] Otimizar imports de bibliotecas
- [ ] Remover/ajustar refetchInterval
- [ ] Adicionar memoização onde necessário
- [ ] Testar funcionalidades
- [ ] Documentar mudanças no guia
- [ ] Criar commit com as otimizações

## Diretrizes Importantes

1. **Não quebrar funcionalidades existentes**
2. **Priorizar mudanças de alto impacto**
3. **Manter tipagem TypeScript correta**
4. **Documentar todas as mudanças**
5. **Testar após cada grupo de mudanças**

---

**Referência completa:** `docs/md/otimizacao.md`
