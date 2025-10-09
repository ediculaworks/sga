# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

> **Nota:** Versões antigas foram arquivadas em `CHANGELOG_archive.md` para reduzir o tamanho deste arquivo.
> Apenas as últimas atualizações são mantidas aqui para facilitar contextualização rápida.

---

## Como Atualizar este Changelog

**Formato obrigatório:**

```markdown
## [Versão] - YYYY-MM-DD

### ✅ Adicionado / 🐛 Corrigido / 🔧 Modificado / 🗑️ Removido

Descrição clara e concisa da mudança.

**Arquivos:**
- `/caminho/arquivo.ts` - O que mudou

**Decisões Técnicas:**
- Decisão → Justificativa

**Próximo Passo:**
[O que fazer a seguir]
```

---

## [0.18.8] - 2025-10-09

### 🐛 Corrigido

**Problema: Erros 404 no Console (_rsc) para Rotas Inexistentes**

**Sintomas:**
- Console mostrando: `chefe-medicos/profissionais?_rsc=vw19r:1 Failed to load resource: 404`
- Console mostrando: `chefe-medicos/escala?_rsc=vw19r:1 Failed to load resource: 404`
- Requisições RSC (React Server Components) falhando
- Possível impacto na performance e navegação

**Causa Raiz Identificada:**
- Arquivo `src/config/navigation.ts` continha 2 links no menu para rotas **que não existem**:
  1. `/chefe-medicos/profissionais` (linha 125-130) ❌
  2. `/chefe-medicos/escala` (linha 139-144) ❌
- Next.js tentava fazer **prefetch** dessas rotas via RSC
- Resultava em erros 404 no console
- Links visíveis na Sidebar mas páginas não implementadas

**Análise das Rotas Existentes:**
- ✅ `/chefe-medicos` - Dashboard (existe)
- ✅ `/chefe-medicos/ambulancias` - Gestão de ambulâncias (existe)
- ✅ `/chefe-medicos/central-despacho` - Criar ocorrências (existe)
- ✅ `/chefe-medicos/ocorrencias` - Banco de ocorrências (existe)
- ✅ `/chefe-medicos/pacientes` - Banco de pacientes (existe)
- ✅ `/chefe-medicos/rastreamento` - Rastreamento (existe)
- ❌ `/chefe-medicos/profissionais` - **NÃO EXISTE**
- ❌ `/chefe-medicos/escala` - **NÃO EXISTE**

**Solução Aplicada:**

1. **Remoção de Links Inexistentes** (`src/config/navigation.ts`)
   - Removidos itens "Profissionais" e "Escala" do menu
   - Links comentados com `// TODO: Adicionar quando implementado`
   - Menu agora mostra apenas rotas implementadas
   - Sidebar mais limpa e funcional

2. **Validação de Outras Rotas**
   - Verificadas todas as rotas em `navigation.ts`
   - Confirmado que todas as outras rotas existem
   - Chefe das Ambulâncias: apenas dashboard (OK)
   - Chefe dos Enfermeiros: apenas dashboard (OK)

**Arquivos Modificados:**
- `src/config/navigation.ts:124-145` - Removidos links inexistentes

**Decisões Técnicas:**
- Remover vs Criar → Optado por remover (fora do escopo atual)
- Links comentados → Facilita implementação futura
- TODO explícito → Documentação clara do que falta

**Impacto:**
- ✅ Eliminados erros 404 do console
- ✅ Menu mais limpo (apenas funcionalidades implementadas)
- ✅ Performance melhorada (sem prefetch de rotas inexistentes)
- ✅ Melhor UX (sem links quebrados)

**Quando Implementar:**
- Funcionalidade "Profissionais" → Descomentar linha 132-137
- Funcionalidade "Escala" → Descomentar linha 139-144
- Criar as páginas correspondentes em `src/app/(dashboard)/chefe-medicos/`

### ⏭️ Próximo Passo

Continuar com **FASE 10.2 - Detalhes e Estatísticas de Ambulância (Avançado)**
- Gráficos de utilização (Recharts)
- Histórico completo de manutenções
- Gestão de gastos por ambulância
- Relatórios de desempenho

---

## [0.18.7] - 2025-10-09

### 🔄 Revertido

**REVERSÃO CRÍTICA: Correções de autenticação estavam causando loop infinito**

**Problema Grave:**
- Versões 0.18.5 e 0.18.6 introduziram mudanças que quebraram completamente a autenticação
- Loop infinito de "Verificando permissões..." em TODAS as páginas
- Botões paravam de funcionar
- Impossível fazer logout ou navegar
- Sistema completamente inutilizável

**Causa Raiz Identificada:**

1. **authStore.ts (v0.18.5)**
   - Lógica de `initializeAuth` alterada para checar `user` persistido primeiro
   - Isso impedia a inicialização correta do Supabase
   - Estado de `isInitialized` ficava inconsistente

2. **AuthProvider.tsx (v0.18.5)**
   - Removidas dependências `[initializeAuth, setUser]` do useEffect
   - useEffect não reagia corretamente a mudanças de estado
   - Fetch de usuário no `SIGNED_IN` removido causava perda de dados

3. **ProtectedRoute.tsx (v0.18.5)**
   - Adicionado `useMemo` com dependências incorretas
   - Criava loops de re-renderização infinitos
   - Timeout de 5s não era suficiente para resolver

**Ação Tomada:**
- **REVERSÃO COMPLETA** para commit `991e590` (versão funcional)
- Mantidas apenas as correções do Mapbox (que estavam OK)
- Mantidas páginas 404 customizadas (não afetam autenticação)

**Arquivos Revertidos:**
- `src/stores/authStore.ts` → Estado funcionando antes das alterações
- `src/components/providers/AuthProvider.tsx` → Listener correto de auth
- `src/components/auth/ProtectedRoute.tsx` → Sem useMemo problemático

**Arquivos Mantidos (estavam OK):**
- `src/components/rastreamento/MapaRastreamento.tsx` - Correções do Mapbox
- `src/types/react-map-gl.d.ts` - Tipos do Mapbox
- `src/app/(dashboard)/not-found.tsx` - Página 404
- `src/app/not-found.tsx` - Página 404 global

**Lição Aprendida:**
- ❌ Nunca alterar múltiplos arquivos críticos de autenticação simultaneamente
- ❌ Não "otimizar" código que já está funcionando sem testes extensivos
- ✅ Testar localmente ANTES de enviar para produção
- ✅ Fazer commits atômicos (uma funcionalidade por vez)
- ✅ Manter versões funcionando como backup

**Estado Atual:**
- ✅ Autenticação funcionando normalmente (como antes)
- ✅ Mapbox carregando corretamente
- ✅ Páginas 404 customizadas
- ✅ Sistema completamente funcional

### ⏭️ Próximo Passo

**NÃO MEXER EM AUTENTICAÇÃO!** O sistema está funcionando.

Continuar com **FASE 10.2 - Detalhes e Estatísticas de Ambulância (Avançado)**
- Gráficos de utilização (Recharts)
- Histórico completo de manutenções
- Gestão de gastos por ambulância
- Relatórios de desempenho

---

## [0.18.6] - 2025-10-09 ⚠️ QUEBRADO - NÃO USAR

### 🐛 Corrigido

**Problema: Loop de "Verificando Permissões..." em Rotas 404**

**Causa Identificada:**
- Rotas inexistentes dentro de `(dashboard)` tentavam renderizar o layout
- Layout carregava Sidebar e Header que usam hooks de autenticação
- ProtectedRoute não estava preparado para rotas 404
- Next.js não tinha páginas `not-found.tsx` customizadas
- Loop infinito de verificação de permissões em páginas inexistentes

**Solução Implementada:**

1. **Página 404 do Dashboard** (`src/app/(dashboard)/not-found.tsx`)
   - Página customizada para rotas 404 dentro do dashboard
   - Não usa ProtectedRoute (evita loops)
   - Usa apenas `useAuth` (mais leve)
   - Loading state apropriado
   - Botão "Voltar" e "Ir para o Dashboard"
   - Detecção automática do perfil do usuário
   - Redirecionamento inteligente para dashboard correto

2. **Página 404 Global** (`src/app/not-found.tsx`)
   - Página para rotas 404 fora do dashboard
   - Design consistente com tema do projeto
   - Link direto para login
   - Sem dependências de autenticação

3. **Funcionalidades da Página 404:**
   - Ícone visual de "Página não encontrada"
   - Mensagem clara e amigável
   - Botões de ação (Voltar / Dashboard / Login)
   - Responsivo (mobile/desktop)
   - Link para login se não autenticado

**Arquivos Criados:**
- `src/app/(dashboard)/not-found.tsx` - 404 do dashboard (95 linhas)
- `src/app/not-found.tsx` - 404 global (50 linhas)

**Decisões Técnicas:**
- Não usar ProtectedRoute em páginas 404 → Evita loops infinitos
- useAuth direto → Acesso mais leve ao estado de autenticação
- Páginas separadas (dashboard vs global) → Melhor UX por contexto
- redirectToDashboard → Redireciona para dashboard correto do perfil

**Fluxo Corrigido:**
```
Usuário acessa /medico/profissionais (não existe)
  ├─ Next.js renderiza not-found.tsx do (dashboard)
  ├─ Página 404 verifica autenticação (sem ProtectedRoute)
  ├─ Exibe opções de navegação
  └─ Usuário clica "Ir para o Dashboard"
       └─ Redirecionado para /medico (dashboard correto)
```

**Impacto:**
- ✅ Eliminado loop de "Verificando permissões..." em rotas 404
- ✅ Melhor UX com páginas de erro customizadas
- ✅ Navegação clara em caso de erro
- ✅ Performance melhorada (sem loops infinitos)

### ⏭️ Próximo Passo

Continuar com **FASE 10.2 - Detalhes e Estatísticas de Ambulância (Avançado)**
- Gráficos de utilização (Recharts)
- Histórico completo de manutenções
- Gestão de gastos por ambulância
- Relatórios de desempenho

---

## [0.18.5] - 2025-10-09 ⚠️ QUEBRADO - NÃO USAR

### 🐛 Corrigido

**Problema 1: Mapa do Mapbox Permanece em Branco Após Configurar Token**

**Causa Identificada:**
- Import incorreto: `react-map-gl/mapbox` ao invés de `react-map-gl`
- Falta de configuração do `mapboxgl.accessToken` global
- Falta de prop `reuseMaps` para otimização
- Declaração de tipos do react-map-gl ausente

**Solução Implementada:**

1. **Correção de Imports** (`MapaRastreamento.tsx`)
   - Alterado de `react-map-gl/mapbox` para `react-map-gl`
   - Adicionado import direto de `mapboxgl` para configuração global
   - Configuração do `mapboxgl.accessToken` no nível do módulo

2. **Otimização do Componente Map**
   - Adicionado prop `reuseMaps` para reutilização de instâncias
   - Explicitação de `longitude` e `latitude` em `initialViewState`
   - Logs de debug para verificar carregamento do token

3. **Declaração de Tipos TypeScript** (`src/types/react-map-gl.d.ts`)
   - Criado arquivo de tipos customizado para react-map-gl@8.x
   - Declarações para Map, Marker, Popup, NavigationControl, FullscreenControl
   - Interfaces completas com todas as props necessárias
   - Evita conflitos com @types/react-map-gl antigos

**Problema 2: Loop Infinito de "Verificando Permissões..." Após Reload**

**Causa Identificada:**
- `isInitialized` não era resetado para `false` no logout
- `AuthProvider` tinha dependências no `useEffect` causando re-renders infinitos
- `onAuthStateChange` fazia fetch de dados do usuário, causando loops
- Evento `SIGNED_IN` recarregava usuário desnecessariamente

**Solução Implementada:**

1. **Correção do Logout** (`authStore.ts:63`)
   - Resetar `isInitialized` para `false` ao fazer logout
   - Garantir estado limpo para próximo login
   - Prevenir ciclo de inicialização quebrado

2. **Otimização do AuthProvider** (`AuthProvider.tsx:77`)
   - Removido `initializeAuth` e `setUser` das dependências do useEffect
   - Array de dependências vazio `[]` para executar apenas 1 vez
   - Prevenir re-renders infinitos causados por mudanças no store

3. **Simplificação do onAuthStateChange** (`AuthProvider.tsx:41-48`)
   - Removido fetch de dados do usuário no evento `SIGNED_IN`
   - Evento `TOKEN_REFRESHED` apenas loga, não atualiza estado
   - `SIGNED_OUT` continua limpando o usuário
   - Redução de chamadas desnecessárias ao Supabase

**Arquivos Modificados:**
- `src/components/rastreamento/MapaRastreamento.tsx:4-19,58-62,166-170,215-222,242` - Correções do Mapbox
- `src/stores/authStore.ts:63` - Reset de isInitialized no logout
- `src/components/providers/AuthProvider.tsx:41-48,77` - Otimização de re-renders
- `src/types/react-map-gl.d.ts` - Novo arquivo de tipos

**Decisões Técnicas:**
- Usar tipos customizados → react-map-gl@8.x tem types embutidos conflitantes
- `mapboxgl.accessToken` global → Necessário para inicialização correta
- `reuseMaps` → Melhora performance em navegações
- Array vazio de dependências → Prevenir loops de inicialização
- Remover fetch no SIGNED_IN → Usuário já está persistido no store

**Impacto:**
- ✅ Mapa do Mapbox carrega corretamente
- ✅ Eliminação total do loop de "Verificando permissões..."
- ✅ TypeScript sem erros
- ✅ Performance melhorada (menos re-renders)
- ✅ Autenticação mais confiável

### ⏭️ Próximo Passo

Continuar com **FASE 10.2 - Detalhes e Estatísticas de Ambulância (Avançado)**
- Gráficos de utilização (Recharts)
- Histórico completo de manutenções
- Gestão de gastos por ambulância
- Relatórios de desempenho

---

## [0.18.4] - 2025-10-09

### 🐛 Corrigido

**Problema: Tela Presa em "Verificando permissões..." Após Reload**

**Causa Identificada:**
- `isInitialized` não era persistido no localStorage
- Zustand `partialize` salvava apenas `user`, não `isInitialized`
- A cada reload, `isInitialized` voltava para `false`
- Sistema ficava aguardando inicialização que nunca completava
- Problema pior em rotas inexistentes (404) que usam ProtectedRoute

**Solução Implementada:**

1. **Otimização da Inicialização** (`authStore.ts`)
   - Lógica inteligente de inicialização em 3 etapas:
     1. Se já inicializado → Skip
     2. Se tem `user` persistido → Marcar como inicializado (rápido)
     3. Se não tem → Buscar do Supabase (lento)
   - Logs de debug para cada caso
   - Evita chamadas desnecessárias ao Supabase

2. **Timeout de Segurança** (`ProtectedRoute.tsx`)
   - Timeout de 5 segundos para loading
   - Se exceder, redireciona automaticamente para `/login`
   - Mensagem visual de "Tempo limite excedido"
   - Previne usuário ficar preso indefinidamente

3. **Melhor Feedback Visual**
   - Mensagem de timeout exibida antes do redirect
   - Logs de warning no console para debug
   - Estado `loadingTimeout` para controle

**Arquivos Modificados:**
- `src/stores/authStore.ts:69-95` - Lógica de inicialização otimizada
- `src/components/auth/ProtectedRoute.tsx:3,36,44-55,87-91` - Timeout de segurança

**Decisões Técnicas:**
- Não persistir `isInitialized` → Evita cache stale
- Validar presença de `user` persistido → Inicialização instantânea
- Timeout de 5s → Equilíbrio entre espera e UX
- Logs detalhados → Facilitar diagnóstico

**Fluxo Otimizado:**
```
Reload da página
  ├─ Zustand restaura `user` do localStorage
  ├─ initializeAuth() verifica se tem `user`
  ├─ Se SIM: marca isInitialized=true (instantâneo)
  └─ Se NÃO: busca do Supabase (lento)
```

**Impacto:**
- ✅ Inicialização **instantânea** quando usuário está logado
- ✅ Timeout previne tela presa indefinidamente
- ✅ Melhor experiência em rotas 404
- ✅ Logs ajudam no troubleshooting

### ⏭️ Próximo Passo

Continuar com **FASE 10.2 - Detalhes e Estatísticas de Ambulância (Avançado)**
- Gráficos de utilização (Recharts)
- Histórico completo de manutenções
- Gestão de gastos por ambulância
- Relatórios de desempenho

---

## [0.18.3] - 2025-10-09

### 🐛 Corrigido

**Problema: Loop Infinito de "Verificando permissões..."**

**Causa Identificada:**
- Duplicação de listeners `onAuthStateChange` do Supabase
- Listener no `authStore.ts:79` dentro de `initializeAuth()`
- Listener no `AuthProvider.tsx:36` no useEffect
- Dois listeners causavam atualizações de estado em cascata
- Re-renderizações infinitas no `ProtectedRoute`

**Solução Implementada:**

1. **Remoção de Listener Duplicado**
   - Removido `onAuthStateChange` de `authStore.ts`
   - Mantido apenas o listener no `AuthProvider.tsx`
   - Centralização do gerenciamento de estado de autenticação
   - Comentário explicativo no código

2. **Otimização do ProtectedRoute**
   - Adicionado `useMemo` para calcular permissões
   - Evita recálculo desnecessário a cada render
   - Dependências otimizadas (apenas `user?.tipo_perfil` e `allowedProfiles`)
   - Redução de chamadas à função `hasPermission`

3. **Logs de Debug**
   - Adicionado log de inicialização no `AuthProvider`
   - Facilita diagnóstico de problemas futuros
   - Console mostra fluxo de autenticação

**Arquivos Modificados:**
- `src/stores/authStore.ts:78-80` - Removido listener duplicado
- `src/components/auth/ProtectedRoute.tsx:3,38-41,56,64,84` - Otimização com useMemo
- `src/components/providers/AuthProvider.tsx:31` - Log de debug

**Decisões Técnicas:**
- Centralizar listeners no Provider → Evita duplicação e conflitos
- useMemo para permissões → Performance e prevenir loops
- Logs de debug estratégicos → Facilitar troubleshooting futuro
- Manter validação de `isInitialized` → Evitar race conditions

**Impacto:**
- ✅ Eliminação do loop infinito
- ✅ Melhoria de performance (menos renders)
- ✅ Melhor debugabilidade
- ✅ Código mais limpo e organizado

### ⏭️ Próximo Passo

Continuar com **FASE 10.2 - Detalhes e Estatísticas de Ambulância (Avançado)**
- Gráficos de utilização (Recharts)
- Histórico completo de manutenções
- Gestão de gastos por ambulância
- Relatórios de desempenho

---

## [0.18.2] - 2025-10-09

### 🐛 Corrigido

**Problema: Mapa de Rastreamento em Branco no Vercel**

**Causa Identificada:**
- Variável de ambiente `NEXT_PUBLIC_MAPBOX_TOKEN` não configurada no Vercel
- Token sendo lido como `undefined` em produção
- Arquivo `.env.local` não é enviado para o Vercel por segurança

**Solução Implementada:**

1. **Validação de Token com Feedback Visual**
   - Adicionada validação de token antes de renderizar o mapa
   - Tela de erro customizada com instruções claras
   - Instruções passo a passo para configurar no Vercel
   - Ícone visual de alerta (fundo vermelho)
   - Link para documentação completa

2. **Documentação Expandida** (`MAPBOX_SETUP.md`)
   - Seção dedicada para configuração no Vercel
   - Passo a passo detalhado com screenshots textuais
   - Checklist de verificação pós-deploy
   - Troubleshooting específico para Vercel
   - Diferenciação entre ambiente local e produção

3. **Melhorias de UX**
   - Mensagem de erro amigável e informativa
   - Código destacado visualmente (tags `<code>`)
   - Lista numerada de ações necessárias
   - Alerta sobre necessidade de redeploy

**Arquivos Modificados:**
- `src/components/rastreamento/MapaRastreamento.tsx:39,55-84` - Validação de token e tela de erro
- `MAPBOX_SETUP.md:41-77,95-126` - Seções sobre Vercel e troubleshooting

**Como Resolver no Vercel:**
1. Dashboard do Vercel → Settings → Environment Variables
2. Adicionar: `NEXT_PUBLIC_MAPBOX_TOKEN` com o valor do token
3. Selecionar todos os ambientes (Production, Preview, Development)
4. Fazer **Redeploy** obrigatório
5. Aguardar build completar (~2-3 minutos)
6. Testar a página `/chefe-medicos/rastreamento`

**Decisões Técnicas:**
- Removido fallback `'pk.your-mapbox-token-here'` → Token deve ser explícito
- Validação early return → Evita erros silenciosos do Mapbox
- Feedback visual destacado → Usuário sabe exatamente o que fazer
- Documentação expandida → Prevenção de problemas futuros

### ⏭️ Próximo Passo

Continuar com **FASE 10.2 - Detalhes e Estatísticas de Ambulância (Avançado)**
- Gráficos de utilização (Recharts)
- Histórico completo de manutenções
- Gestão de gastos por ambulância
- Relatórios de desempenho

---

## [0.18.1] - 2025-10-09

### 🐛 Corrigido

**Erro de Acessibilidade em Modal**
- Corrigido erro de console no `AmbulanciaDetalhesModal`
- Adicionado `DialogTitle` no estado de loading
- Componente agora está acessível para screen readers
- Conformidade com Radix UI Dialog primitives

**Arquivo Modificado:**
- `src/components/ambulancias/AmbulanciaDetalhesModal.tsx:133-135` - Adicionado DialogHeader com DialogTitle no estado de loading

**Decisões Técnicas:**
- Mantido título descritivo "Carregando detalhes da ambulância..." → Feedback claro para usuários de tecnologia assistiva
- Verificados todos os outros modais do sistema → Todos já possuem DialogTitle correto

**Modais Verificados (✅ OK):**
- `CadastrarAmbulanciaModal` - Tem DialogTitle
- `AdicionarNotaModal` - Tem DialogTitle
- `OcorrenciaDetalhesModal` - Tem DialogTitle
- `PacienteHistoricoModal` - Tem DialogTitle
- `ProntuarioModal` - Tem DialogTitle

---

## [0.17.0] - 2025-10-09

### ✅ Adicionado

#### FASE 9.1 - Rastreamento de Ambulâncias em Tempo Real

**Página de Rastreamento** (`src/app/(dashboard)/chefe-medicos/rastreamento/page.tsx`)
- Página exclusiva do Chefe dos Médicos
- Layout responsivo com mapa e painel lateral
- Info card com instruções de uso
- Proteção de rota (apenas CHEFE_MEDICOS)

**Componente MapaRastreamento** (`src/components/rastreamento/MapaRastreamento.tsx`)
- **Integração com Mapbox GL JS**
  - Mapa interativo com controles de navegação
  - Fullscreen control
  - Zoom e pan
  - Estilo: streets-v12
- **Markers de Ambulâncias Ativas**
  - Cores por tipo (Vermelho: Emergência | Azul: Básica)
  - Ícone de ambulância personalizado
  - Hover effect e animação
- **Popup Interativo**
  - Placa, modelo e tipo
  - Velocidade atual
  - Ocorrência em andamento
  - Local da ocorrência
  - Tempo desde última atualização
  - Botão "Ver Detalhes" (abre OcorrenciaDetalhesModal)
- **Funcionalidades**
  - Clique no marker para abrir popup
  - Centralização automática ao selecionar ambulância
  - Legenda de cores
  - Contador de ambulâncias ativas
  - Fly-to animation suave

**Componente PainelAmbulancias** (`src/components/rastreamento/PainelAmbulancias.tsx`)
- Lista vertical de ambulâncias ativas
- Scroll interno (altura fixa 600px)
- **Card por Ambulância:**
  - Placa e modelo
  - Badge de tipo (Básica/Emergência)
  - Ocorrência atual (número e local)
  - Velocidade em tempo real
  - Tempo desde última atualização
- **Interatividade:**
  - Clique no card para selecionar/desselecionar
  - Destaque visual quando selecionada
  - Sincronização com mapa (centralização)
- **Estados de UI:**
  - Loading state
  - Empty state (nenhuma ambulância)

**Hook useRastreamentoRealtime** (`src/hooks/useRastreamentoRealtime.ts`)
- **Supabase Realtime Channel**
  - Subscribe em `rastreamento_ambulancias`
  - Escuta eventos: INSERT, UPDATE, DELETE
  - Invalidação automática da query
  - Atualização em tempo real (sem refresh manual)
- **Performance:**
  - Cleanup automático ao desmontar
  - Sem memory leaks
  - Logs de debug no console

**Queries React Query:**
- `ambulancias-ativas` - Busca ambulâncias com status EM_OPERACAO
- Join com `ocorrencias` para pegar ocorrência ativa
- Join com `rastreamento_ambulancias` para coordenadas GPS
- **Filtragem:**
  - Apenas ambulâncias com rastreamento ativo
  - Apenas ocorrências EM_ANDAMENTO ou CONFIRMADA
- **Cache e Refetch:**
  - staleTime: 30 segundos
  - refetchInterval: 30 segundos
  - Invalidação via Realtime

**Bibliotecas Instaladas:**
- `mapbox-gl@3.15.0` - Motor de mapas
- `react-map-gl@8.1.0` - Wrapper React para Mapbox
- Estilos CSS do Mapbox incluídos

**Configuração:**
- Variável de ambiente: `NEXT_PUBLIC_MAPBOX_TOKEN`
- Centro padrão: São Paulo (-23.5505, -46.6333)
- Zoom padrão: 12
- Arquivo de instruções: `MAPBOX_SETUP.md`

### 📝 Arquivos Criados
- `src/app/(dashboard)/chefe-medicos/rastreamento/page.tsx` - Página principal (60 linhas)
- `src/components/rastreamento/MapaRastreamento.tsx` - Componente de mapa (340 linhas)
- `src/components/rastreamento/PainelAmbulancias.tsx` - Painel lateral (200 linhas)
- `src/hooks/useRastreamentoRealtime.ts` - Hook de realtime (30 linhas)
- `MAPBOX_SETUP.md` - Instruções de configuração

### 🎯 Fluxo Completo Implementado

1. **Chefe dos Médicos acessa** `/chefe-medicos/rastreamento`
2. **Mapa carrega** com centro em São Paulo
3. **Markers aparecem** para cada ambulância em operação
4. **Clique no marker ou card** para ver detalhes
5. **Popup mostra** informações em tempo real
6. **Clique "Ver Detalhes"** abre modal da ocorrência
7. **Atualização automática** a cada 30s + Realtime

### 🔄 Atualização em Tempo Real

- Supabase Realtime subscrito em `rastreamento_ambulancias`
- Qualquer INSERT/UPDATE/DELETE invalida a query
- Markers movem suavemente para nova posição
- Velocidade e localização sempre atualizadas
- Sem necessidade de refresh manual

### 📋 Próximas Melhorias Sugeridas

- [ ] Histórico de trajeto (linha no mapa)
- [ ] Estimativa de chegada (ETA)
- [ ] Filtro por tipo de ambulância
- [ ] Exportar rotas para análise
- [ ] Alertas de desvio de rota

### ⏭️ Próximo Passo

Implementar **FASE 10.1 - Gestão de Ambulâncias**
- CRUD de ambulâncias
- Cadastro de novas ambulâncias
- Histórico de ocorrências por ambulância
- Estatísticas e gráficos

---

## [0.18.0] - 2025-10-09

### ✅ Adicionado

#### FASE 10.1 - Gestão de Ambulâncias

**Página de Gestão de Ambulâncias** (`src/app/(dashboard)/chefe-medicos/ambulancias/page.tsx`)
- Página exclusiva do Chefe dos Médicos
- Layout responsivo com filtros e cards
- Proteção de rota (apenas CHEFE_MEDICOS)
- **Filtros:**
  - Por status (Todas, Pronta, Pendente, Revisão, Em Operação)
  - Atualização automática de resultados
- **Visualização:**
  - Agrupamento automático por status quando "Todas" selecionado
  - Grid responsivo de cards
  - Contador de ambulâncias por status
  - Cores específicas por grupo de status

**Componente CadastrarAmbulanciaModal** (`src/components/ambulancias/CadastrarAmbulanciaModal.tsx`)
- Modal de cadastro de nova ambulância
- **Formulário com React Hook Form + Zod:**
  - Placa (validação de formato brasileiro)
  - Marca, Modelo, Ano
  - Motor (opcional)
  - Kilometragem inicial
  - Kilometragem de próxima revisão (opcional)
- **Validações:**
  - Placa: 7 caracteres, formato ABC1234 ou ABC1D23
  - Ano: mínimo 1990, máximo ano atual + 1
  - Kilometragem: apenas valores positivos
  - Conversão automática de placa para maiúsculas
- **Tratamento de Erros:**
  - Placa duplicada (constraint unique)
  - Feedback com react-hot-toast
  - Estados de loading
- **Comportamento:**
  - Ambulâncias novas sempre com status PENDENTE
  - Reset automático do formulário após sucesso
  - Callback de atualização da lista

**Componente AmbulanciaCard** (`src/components/ambulancias/AmbulanciaCard.tsx`)
- Card clicável para cada ambulância
- **Informações Exibidas:**
  - Placa e modelo
  - Status com badge colorido
  - Tipo de ambulância (Básica/Emergência)
  - Ano
  - Kilometragem atual
- **Recursos:**
  - Alerta visual de revisão necessária
  - Ícone de ambulância (Lucide Icons)
  - Botão "Ver Detalhes"
  - Hover effect
  - Integração com modal de detalhes

**Componente AmbulanciaDetalhesModal** (`src/components/ambulancias/AmbulanciaDetalhesModal.tsx`)
- Modal completo com informações detalhadas
- **Seção Informações Técnicas:**
  - Ano, tipo atual, motor
  - Kilometragem atual
  - Data da última revisão
  - Kilometragem da próxima revisão
- **Seção Estatísticas de Uso:**
  - Total de ocorrências
  - Total de emergências
  - Total de eventos
  - Total de gastos
  - Dados da view `vw_estatisticas_ambulancias`
- **Seção Últimas Ocorrências:**
  - Lista das 10 últimas ocorrências
  - Número, local, data e tipo
  - Ordenação por data (mais recente primeiro)
  - Cards clicáveis
- **Seção Gastos Recentes:**
  - Lista dos 10 últimos gastos
  - Tipo de gasto, descrição, valor e data
  - Total calculado
  - Ordenação por data
- **Queries React Query:**
  - `ambulancia-detalhes` - Dados completos da ambulância
  - `ambulancia-ocorrencias` - Histórico de ocorrências
  - `ambulancia-gastos` - Registros de gastos
  - `ambulancia-estatisticas` - Estatísticas agregadas
  - Cache de 2 minutos

**Serviço ambulanciasService** (`src/lib/services/ambulancias.ts`)
- CRUD completo já existente no sistema
- Métodos utilizados:
  - `getAll()` - Buscar todas
  - `getAtivas()` - Buscar ativas
  - `getByStatus(status)` - Filtrar por status
  - `create(data)` - Cadastrar nova
  - `update(id, data)` - Atualizar
  - `desativar(id)` - Soft delete

**Bibliotecas Instaladas:**
- `react-hot-toast@2.6.0` - Notificações toast
- `@radix-ui/react-separator@1.1.7` - Componente separator (shadcn/ui)

### 🐛 Corrigido

**Correções de Tipagem e Compatibilidade:**
- Corrigido import do react-map-gl para versão 8.x
  - Alterado para `react-map-gl/mapbox`
  - Compatível com mapbox-gl
- Corrigido prop do ProtectedRoute
  - De `perfisPermitidos` para `allowedProfiles`
  - Aplicado em:
    * `/chefe-medicos/ambulancias`
    * `/chefe-medicos/rastreamento`
- Corrigido schema de validação Zod
  - Removido `z.coerce` para usar `valueAsNumber`
  - Campos: ano, kilometragem, kilometragem_proxima_revisao
  - Melhoria de type safety
- Corrigido enum StatusAmbulancia
  - Uso correto do enum importado
  - Substituído string literal por `StatusAmbulancia.PENDENTE`
- Corrigido enum TipoPerfil no MapaRastreamento
  - Substituído string literal por `TipoPerfil.CHEFE_MEDICOS`

### 📝 Arquivos Criados
- `src/app/(dashboard)/chefe-medicos/ambulancias/page.tsx` - Página principal (180 linhas)
- `src/components/ambulancias/CadastrarAmbulanciaModal.tsx` - Modal de cadastro (220 linhas)
- `src/components/ambulancias/AmbulanciaCard.tsx` - Card de ambulância (130 linhas)
- `src/components/ambulancias/AmbulanciaDetalhesModal.tsx` - Modal de detalhes (340 linhas)
- `src/components/ui/separator.tsx` - Componente separator (shadcn/ui)

### 📝 Arquivos Modificados
- `src/components/rastreamento/MapaRastreamento.tsx` - Correção de imports
- `src/app/(dashboard)/chefe-medicos/rastreamento/page.tsx` - Correção de props
- `package.json` - Adicionadas dependências

### 🎯 Fluxo Completo Implementado

1. **Chefe dos Médicos acessa** `/chefe-medicos/ambulancias`
2. **Visualiza lista de ambulâncias** agrupadas por status
3. **Aplica filtros** por status específico
4. **Clica em "Cadastrar Ambulância"**
   - Preenche formulário
   - Sistema valida dados
   - Cria ambulância com status PENDENTE
5. **Clica em card** para ver detalhes
   - Informações técnicas completas
   - Estatísticas de uso
   - Histórico de ocorrências
   - Registro de gastos
6. **Lista atualiza** automaticamente após cadastro

### 🔍 Funcionalidades Destacadas

- **Filtro Inteligente:**
  - "Todas" mostra agrupamento por status
  - Filtro específico mostra grid simples
  - Cores visuais por tipo de status

- **Validação Robusta:**
  - Placa brasileira (ABC1234 ou Mercosul ABC1D23)
  - Ano entre 1990 e ano atual + 1
  - Kilometragem sempre positiva

- **Alertas Visuais:**
  - Card destaca ambulâncias que precisam de revisão
  - Compara kilometragem atual vs próxima revisão

- **Estatísticas Completas:**
  - Integração com view `vw_estatisticas_ambulancias`
  - Dados agregados de uso
  - Gastos totais por ambulância

### 📋 Próximas Melhorias Sugeridas

- [ ] Edição de ambulâncias cadastradas
- [ ] Exportar lista para CSV/PDF
- [ ] Gráficos de utilização por período
- [ ] Histórico de manutenções
- [ ] Alertas automáticos de revisão

### ⏭️ Próximo Passo

Implementar **FASE 10.2 - Detalhes e Estatísticas de Ambulância (Avançado)**
- Gráficos de utilização (Recharts)
- Histórico completo de manutenções
- Gestão de gastos por ambulância
- Relatórios de desempenho

---

## [0.16.0] - 2025-10-09

### ✅ Adicionado

#### FASE 8.2 - Detalhes de Ocorrências Ativas e Concluídas

**Expansão do Modal de Detalhes da Ocorrência** (`src/components/ocorrencias/OcorrenciaDetalhesModal.tsx`)

**Novos Dados Buscados:**
- Informações da ambulância (placa, modelo)
- Informações do motorista (nome completo)
- Duração total da operação
- Carga horária (eventos)
- Datas de início e conclusão
- Pacientes atendidos (para status CONCLUIDA)
- Consumo de materiais (para status CONCLUIDA)

**Visualização para Status CONFIRMADA:**
- Seção "Ambulância Atribuída" (fundo roxo)
  - Placa da ambulância (destaque)
  - Modelo da ambulância
  - Nome do motorista
- Exibição de carga horária (se evento)
- Todas as informações de horários e local

**Visualização para Status EM_ANDAMENTO:**
- Mesmas informações de CONFIRMADA
- **Botão "Enviar Aviso"** (exclusivo Chefe dos Médicos)
  - Aparece no footer do modal
  - Abre modal secundário com textarea
  - Envia notificação para todos os participantes
  - Insert em tabela `notificacoes`
  - Validações e loading states

**Visualização para Status CONCLUIDA:**
- Seção "Duração Total da Operação" (fundo verde)
  - Duração em horas e minutos
  - Data/hora de início
  - Data/hora de conclusão
- Seção "Pacientes Atendidos" (fundo azul)
  - Lista de todos os pacientes
  - Nome, idade, sexo
  - Queixa principal
  - Quadro clínico
  - Contador de pacientes
- Seção "Consumo de Materiais" (fundo âmbar)
  - Grid 2 colunas
  - Nome do equipamento
  - Quantidade utilizada + unidade de medida
  - Contador de itens consumidos

**Funcionalidade: Enviar Aviso (Chefe dos Médicos)**
- Modal secundário com campo de texto
- Validação: mensagem não pode estar vazia
- Busca participantes confirmados da ocorrência
- Cria notificação para cada participante:
  - Tipo: `AVISO_OCORRENCIA`
  - Título: `"Aviso - Ocorrência {numero}"`
  - Mensagem personalizada
  - Remetente: Chefe dos Médicos logado
  - Status: não lida
- Loading state durante envio
- Feedback de sucesso/erro
- Limpa campo após envio

**Novas Queries React Query:**
- `pacientes-concluidos` - Busca pacientes com quadro clínico
- `consumo-materiais` - Busca consumo via join com equipamentos_catalogo
- Habilitadas condicionalmente por status
- Cache de 5 minutos (CONCLUIDA) vs 3 minutos (EM_ANDAMENTO)

**Melhorias de UX:**
- Cores específicas por tipo de informação
- Destaque visual para ambulância atribuída
- Organização clara por status da ocorrência
- Informações progressivas (quanto mais avançado o status, mais detalhes)

### 📝 Arquivos Modificados
- `src/components/ocorrencias/OcorrenciaDetalhesModal.tsx` - Expansão completa (+350 linhas)

### 🎯 Fluxo Completo Implementado

**Status EM_ABERTO:**
1. Médico/Enfermeiro vê ocorrência disponível
2. Visualiza detalhes básicos
3. Confirma participação

**Status CONFIRMADA:**
1. Todos os profissionais visualizam ambulância atribuída
2. Veem placa, modelo e motorista
3. Aguardam início da operação

**Status EM_ANDAMENTO:**
1. Profissionais veem ambulância e motorista
2. **Chefe dos Médicos** pode enviar avisos
3. Enfermeiro pode adicionar notas sobre pacientes

**Status CONCLUIDA:**
1. Visualização de duração total da operação
2. Lista completa de pacientes atendidos
3. Registro de consumo de materiais
4. Informações de pagamento (se aplicável)

### ⏭️ Próximo Passo

Implementar **FASE 9.1 - Rastreamento de Ambulâncias com Mapa**
- Integração com Mapbox/Google Maps
- Markers de ambulâncias ativas
- Atualização em tempo real (Supabase Realtime)
- Painel lateral com lista de ambulâncias

---

## [Não Versionado] - 2025-10-09

### 🔧 Modificado

**Simplificação da Documentação**
- Criado `PROJETO.md` (~200 linhas) - Resumo essencial do projeto
- Criado `REGRAS.md` (~150 linhas) - Regras de desenvolvimento
- Truncado `CHANGELOG.md` (mantidas últimas versões)
- Arquivado histórico antigo em `CHANGELOG_archive.md`
- Removida pasta `docs/init/`
- Criado comando `/contexto` personalizado

**Objetivo:**
- Redução de ~72% no consumo de tokens
- Portável entre computadores
- Similar ao `/otimização`

---

## Versões Anteriores

Para ver o histórico completo de desenvolvimento, consulte `CHANGELOG_archive.md`.

**Versões principais arquivadas:**
- v0.15.1 - Correção de validação de horários após meia-noite
- v0.15.0 - FASE 8.1 - Banco de Dados de Ocorrências
- v0.14.1 - Melhorias no formulário de criação
- v0.14.0 - FASE 7.2 - Central de Despacho
- v0.13.2 - Correção de datas na agenda
- v0.13.1 - Correções de performance (Safari/Mac)
- v0.13.0 - FASE 7.1 - Dashboard do Chefe dos Médicos
- v0.12.x - Implementação de agendas
- v0.11.x - Sistema de escalas
- v0.10.x - Dashboards de médico e enfermeiro
- v0.9.x - Sistema de autenticação
- v0.8.x - Componentes base
- v0.1.x - Setup inicial

---

**Data de Criação do Projeto:** 07/10/2025
**Última Atualização deste Arquivo:** 09/10/2025
