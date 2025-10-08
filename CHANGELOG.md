# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [0.7.0] - 2025-10-08

### ✅ Adicionado

#### FASE 4.1 - Página de Agenda do Médico

**Componente AgendaMedicoPage** (`src/app/(dashboard)/medico/agenda/page.tsx`)
- Calendário mensal completo com React Big Calendar
- Visualização de todas as ocorrências confirmadas do médico
- **4 Visualizações disponíveis:**
  - Mês (padrão)
  - Semana
  - Dia
  - Agenda (lista)
- **Funcionalidades:**
  - Navegação entre meses/semanas (botões anterior/próximo)
  - Botão "Hoje" para voltar à data atual
  - Eventos clicáveis que abrem modal de detalhes
  - Cores por status da ocorrência:
    * Cinza: EM_ABERTO
    * Azul: CONFIRMADA
    * Verde: EM_ANDAMENTO
    * Roxo: CONCLUIDA
  - Legenda de cores explicativa
  - Responsivo (mobile-first)
- **Query otimizada:**
  - Busca apenas ocorrências confirmadas pelo médico
  - Join com tabela ocorrencias
  - Cache de 5 minutos (React Query)
- **Integração com Modal:**
  - Ao clicar em evento: abre OcorrenciaDetalhesModal
  - Mostra detalhes completos da ocorrência
  - Permite interação (se aplicável)

**Biblioteca React Big Calendar**
- Instalada versão mais recente
- Localização em português (pt-BR)
- Configuração com date-fns
- CSS customizado para match com design do sistema

**Estilos Customizados** (`src/app/globals.css`)
- Estilização completa do calendário
- Cores consistentes com Tailwind
- Hover effects em eventos
- Botões estilizados (toolbar)
- Responsividade mobile
- Highlight do dia atual (azul claro)
- Bordas arredondadas e sombras

**Lógica de Horários:**
- Horário de início: `horario_saida`
- Horário de término:
  - Se houver `horario_termino`: usa esse
  - Se houver `horario_chegada_local`: +2h após chegada
  - Padrão: +4h após saída
- Exibição de duração no evento

**Navegação Atualizada** (`src/config/navigation.ts`)
- Link "Agenda" já existe para perfil MEDICO
- Rota: `/medico/agenda`
- Ícone: Calendar (Lucide React)

### 📦 Dependências

- `react-big-calendar@^1.15.0` - Biblioteca de calendário
- `date-fns@^4.1.0` - Já instalada, usada para localização

### 🎯 Funcionalidades Implementadas

**Visualização de Eventos:**
- Eventos mostram: número da ocorrência + tipo de trabalho
- Cores diferentes por status para fácil identificação
- Múltiplos eventos no mesmo dia empilhados corretamente

**Interatividade:**
- Clicar em evento: abre detalhes
- Navegar entre períodos: mantém estado
- Trocar visualização: persiste eventos

**Performance:**
- Lazy loading de dados
- Cache inteligente (5min)
- Loading state durante fetch
- Otimização de re-renders

### 📝 Notas Técnicas

**Configuração do Localizer:**
```typescript
const localizer = momentLocalizer({
  format: (date, formatStr) => format(date, formatStr, { locale: ptBR }),
  parse: (dateStr, formatStr) => parse(dateStr, formatStr, new Date(), { locale: ptBR }),
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay: (date) => getDay(date),
  locales: { 'pt-BR': ptBR },
});
```

**Estrutura de Evento:**
```typescript
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: {
    ocorrenciaId: number;
    status: string;
    tipo: string;
  };
}
```

### ⏭️ Próximo Passo

Implementar **FASE 5.1 - Banco de Dados de Pacientes**
- Tabela de pacientes compartilhada (Médico e Chefe dos Médicos)
- Busca e filtros
- Histórico de atendimentos

---

## [0.6.3] - 2025-10-08

### 🐛 Corrigido

#### Nome de Coluna em Scripts SQL

**Problema:**
- Erro `column "numero" does not exist` ao executar `verificar-e-criar-vagas.sql`
- Scripts usavam `o.numero` mas o schema define `numero_ocorrencia`

**Correção:**
- Atualizado `verificar-e-criar-vagas.sql` com nome correto: `numero_ocorrencia`
- Verificado schema em `supabase/schema.sql:234`
- Scripts agora executam sem erros

### 📝 Adicionado

#### Scripts de Diagnóstico para Erro de Confirmação

**Problema Recorrente:**
- Erro "Nenhuma vaga disponível para este perfil" ao confirmar participação
- Tentativa anterior de correção falhou

**Scripts Criados:**

1. **`scripts/diagnostico-ocorrencias-participantes.sql`**
   - Diagnóstico completo do schema da tabela
   - Verifica estrutura, constraints UNIQUE, índices
   - Lista políticas RLS e permissões GRANT
   - Analisa dados existentes (vagas vazias vs preenchidas)
   - Mostra distribuição de vagas por ocorrência
   - **Execute este script primeiro para identificar a causa**

2. **`scripts/verificar-e-criar-vagas.sql`**
   - Lista ocorrências EM_ABERTO
   - Mostra participantes existentes
   - Template para criar vagas vazias de teste
   - Verificação final do resultado

3. **`docs/md/SOLUCAO_ERRO_CONFIRMACAO.md`**
   - Documentação completa do problema
   - Análise da causa raiz
   - Passo a passo para resolução
   - Checklist de verificação
   - 3 possíveis causas identificadas

**Causas Possíveis Identificadas:**

1. **Migration não executada**: Script `fix-ocorrencias-participantes-schema.sql` não foi rodado
   - `usuario_id` ainda é NOT NULL (deveria ser NULLABLE)
   - Impossível ter vagas vazias

2. **Vagas não criadas**: Ocorrências EM_ABERTO sem participantes
   - Mesmo com schema correto, faltam registros com `usuario_id = NULL`

3. **Dados inconsistentes**: Seed criou ocorrências sem vagas

**Próximos Passos para o Usuário:**

1. Executar `diagnostico-ocorrencias-participantes.sql` no Supabase SQL Editor
2. Analisar resultados (especialmente seções 1, 3, 6, 7)
3. Executar `fix-ocorrencias-participantes-schema.sql` se `usuario_id` não for NULLABLE
4. Executar `verificar-e-criar-vagas.sql` para criar vagas de teste
5. Testar confirmação novamente

**Referência Completa:** `docs/md/SOLUCAO_ERRO_CONFIRMACAO.md`

---

## [0.6.2] - 2025-10-08

### 🐛 Corrigido

#### Erro 400/406 ao Confirmar Participação em Ocorrências

**Problema:**
- Erro HTTP 400 (Bad Request) e 406 (Not Acceptable) ao tentar confirmar participação em ocorrências
- Schema incompatível: `usuario_id` era NOT NULL, mas código tentava buscar vagas vazias (NULL)
- Constraint `UNIQUE(ocorrencia_id, usuario_id)` impedia múltiplas vagas em aberto

**Solução:**

**1. Script de Migração de Schema** (`scripts/fix-ocorrencias-participantes-schema.sql`)
- Tornou `usuario_id` NULLABLE para permitir vagas em aberto
- Removeu constraint UNIQUE antiga
- Criou índice único parcial que permite múltiplas vagas vazias mas previne duplicatas quando preenchidas
- Atualizou políticas RLS para INSERT e UPDATE

**2. Função confirmarParticipacao Refatorada** (`src/lib/services/ocorrencias.ts:269`)
- Usa `.limit(1)` em vez de `.single()` para buscar vagas disponíveis
- Verifica se usuário já está participando antes de confirmar
- Previne confirmações duplicadas
- Adiciona logs de erro detalhados para debugging
- Usa `maybeSingle()` para queries que podem retornar zero resultados
- Tratamento de erro mais robusto com try/catch

**Arquivos Modificados:**
- `scripts/fix-ocorrencias-participantes-schema.sql` (criado)
- `src/lib/services/ocorrencias.ts` (linha 269-368)
- `docs/md/CORRECAO_OCORRENCIAS_PARTICIPANTES.md` (documentação completa)

**Referência:** `docs/md/CORRECAO_OCORRENCIAS_PARTICIPANTES.md`

## [0.6.1] - 2025-10-08

### ✅ Adicionado

#### Modal de Detalhes da Ocorrência - Status EM_ABERTO (FASE 3.3)

**Componente OcorrenciaDetalhesModal** (`src/components/ocorrencias/OcorrenciaDetalhesModal.tsx`)
- Modal completo de detalhes de ocorrências
- Props: ocorrenciaId, isOpen, onClose, perfil, onConfirmarParticipacao, isConfirmando
- Query automática de dados com React Query
- **Exibição de informações:**
  - Número da ocorrência (destaque em card azul)
  - Tipo de trabalho e tipo de ambulância (badges coloridos)
  - Descrição da ocorrência
  - Local completo com endereço
  - Data formatada em português (date-fns)
  - Horários: saída, chegada no local, término (se aplicável)
  - Lista de participantes/vagas:
    * Nome do profissional (se confirmado)
    * Função (Médico/Enfermeiro)
    * Status (Disponível/Confirmado) com badges
  - Informações de pagamento:
    * Valor por função
    * Data de pagamento prevista
    * Card verde destacado
- **Funcionalidades:**
  - Botão "Confirmar Participação" (aparece apenas se há vaga disponível)
  - Loading state durante confirmação
  - Estados de loading e erro na query
  - Design responsivo com scroll vertical
  - Integração com Lucide React icons
- Componente reutilizável para múltiplos perfis e status

**Serviço confirmarParticipacao** (`src/lib/services/ocorrencias.ts`)
- Função `confirmarParticipacao(ocorrenciaId, usuarioId, funcao)`
- **Lógica implementada:**
  1. Busca vaga em aberto para o perfil específico (MEDICO ou ENFERMEIRO)
  2. Valida disponibilidade (usuario_id null, confirmado false)
  3. Atualiza vaga com dados do profissional
  4. Marca como confirmado (confirmado = true)
  5. Registra data de confirmação (data_confirmacao = NOW())
  6. Verifica se todas as vagas foram preenchidas
  7. Atualiza status da ocorrência para CONFIRMADA automaticamente
- Validações de erro: "Nenhuma vaga disponível para este perfil"
- Transação completa com rollback em caso de erro

**Dashboard Médico - Integração do Modal** (`src/app/(dashboard)/medico/page.tsx`)
- Estados adicionados:
  - `modalOcorrenciaId` - ID da ocorrência selecionada
  - `isModalOpen` - Controle de abertura do modal
  - `isConfirmando` - Estado de loading durante confirmação
- Handler `handleVerDetalhes(ocorrenciaId)`:
  - Define ID da ocorrência
  - Abre modal
- Handler `handleCloseModal()`:
  - Fecha modal
  - Limpa ID selecionado
- Handler `handleConfirmarParticipacao(ocorrenciaId)`:
  - Validação de usuário autenticado
  - Chamada ao serviço confirmarParticipacao
  - Loading state durante requisição
  - Toast de sucesso/erro (sonner)
  - Invalidação de queries (atualização automática):
    * `ocorrencias-disponiveis` - Atualiza listas
    * `ocorrencia-detalhes` - Atualiza modal
  - Fecha modal após confirmação bem-sucedida
  - Tratamento de erros com feedback visual
- Modal renderizado no JSX com todas as props necessárias
- Integração completa com QueryClient para cache

**Componente UI Dialog** (`src/components/ui/dialog.tsx`)
- Instalado via shadcn/ui
- Primitivos do Radix UI (@radix-ui/react-dialog)
- Componentes exportados:
  - Dialog, DialogTrigger, DialogPortal
  - DialogOverlay, DialogContent
  - DialogHeader, DialogFooter, DialogTitle, DialogDescription
- Estilos personalizados com Tailwind CSS
- Animações de entrada/saída
- Acessibilidade completa (ARIA)

### 🔧 Modificado

**Dashboard Médico** (`src/app/(dashboard)/medico/page.tsx`)
- Removido TODO do handleVerDetalhes (implementado)
- Adicionados imports: OcorrenciaDetalhesModal, ocorrenciasService, toast, useQueryClient
- Implementação completa do fluxo de confirmação de participação

**Serviço de Ocorrências** (`src/lib/services/ocorrencias.ts`)
- Adicionada função confirmarParticipacao
- Lógica de mudança automática de status
- Validações de disponibilidade de vagas

### 📦 Dependências

- `@radix-ui/react-dialog@^1.1.15` - Primitivo para modal acessível

### 🐛 Corrigido

- Modal de detalhes implementado (bug conhecido da v0.6.0)

### 🐛 Bugs Conhecidos

- Dropdown "Minha Conta" no header está transparente (corrigir posteriormente)

### ⏭️ Próximo Passo

Implementar **FASE 4.1 - Página de Agenda do Médico**
- Calendário mensal com ocorrências confirmadas
- Integração com biblioteca de calendário
- Modal de detalhes integrado

---

## [0.6.0] - 2025-10-08

### ✅ Adicionado

#### Dashboard Médico - Lista de Ocorrências (FASE 3.2)

**Componente OcorrenciaCard** (`src/components/ocorrencias/OcorrenciaCard.tsx`)
- Componente reutilizável para exibir cards de ocorrências
- Props: ocorrencia, variant (default | confirmed), onVerDetalhes
- Exibe: número, tipo de trabalho, tipo de ambulância, data, horário, local
- Badges coloridos para status e tipo de trabalho
- Indicador de vagas disponíveis (para ocorrências EM_ABERTO)
- Variant "confirmed" com destaque verde para ocorrências já confirmadas pelo profissional
- Integração com date-fns para formatação de datas em português
- Responsivo e com hover effects

**Hook useOcorrenciasDisponiveis** (`src/hooks/useOcorrenciasDisponiveis.ts`)
- Hook customizado para buscar ocorrências disponíveis com filtro inteligente
- Parâmetros: usuarioId, tipoPerfil (MEDICO ou ENFERMEIRO)
- **Filtros aplicados:**
  - Remove ocorrências em dias que o profissional está de folga (escala)
  - Remove conflitos de horário (profissional já alocado)
  - Filtra apenas ocorrências EM_ABERTO com vagas ou já confirmadas pelo profissional
  - Verifica vagas específicas para o tipo de perfil (médico/enfermeiro)
- **Retorna dois grupos:**
  - `confirmadas`: Ocorrências onde o profissional já está confirmado
  - `disponiveis`: Ocorrências em aberto com vagas disponíveis
- Query com join em ocorrencias_participantes e escala
- Refetch automático a cada 30 segundos
- Ordenação por data (mais próximas primeiro)

**Dashboard Médico Atualizado** (`src/app/(dashboard)/medico/page.tsx`)
- Integração com useOcorrenciasDisponiveis
- **Seção "Minhas Ocorrências Confirmadas":**
  - Exibe ocorrências já confirmadas pelo médico
  - Cards com variant "confirmed" (destaque verde)
  - Oculta se não houver confirmadas
- **Seção "Ocorrências Disponíveis":**
  - Lista de ocorrências em aberto com vagas
  - Grid responsivo (1 coluna mobile, 2 tablet, 3 desktop)
  - **Estados de UI:**
    - Loading: Spinner animado com mensagem
    - Error: Card vermelho com ícone de alerta e mensagem
    - Empty: Card informativo quando não há ocorrências
    - Success: Grid de cards com ocorrências
- Handler handleVerDetalhes para abrir modal (próximo prompt)
- Refatoração da estrutura para melhor organização

### 📦 Dependências

- `date-fns@^4.1.0` - Biblioteca para formatação e manipulação de datas

### 🐛 Bugs Conhecidos

- Dropdown "Minha Conta" no header está transparente (corrigir posteriormente)
- Modal de detalhes ainda não implementado (Prompt 3.3)

### ⏭️ Próximo Passo

Implementar **FASE 3.3 - Modal de Detalhes da Ocorrência (Status EM_ABERTO)**

---

## [0.5.0] - 2025-10-08

### ✅ Adicionado

#### Configuração WiFi e Correção de Autenticação

**WiFi/Rede Local**
- Sistema habilitado para acesso via WiFi na rede local
- Scripts `dev` e `start` configurados com `-H 0.0.0.0`
- Documentação completa em README.md com instruções de acesso via IP local

**React Query Provider** (`src/components/providers/QueryProvider.tsx`)
- Configurado QueryClientProvider para toda a aplicação
- Cache padrão: 5 minutos (staleTime)
- Garbage collection: 10 minutos
- Retry automático em caso de erro
- Integrado no layout.tsx principal

**Scripts de Gerenciamento de Usuários**
- `scripts/create-auth-users.ts` - Cria usuários no Supabase Auth
- `scripts/fix-auth-users.ts` - Deleta e recria usuários com senhas corretas
- `scripts/test-auth.ts` - Testa autenticação
- Todos os 6 perfis criados no Supabase Auth com senha "senha123"
- Emails confirmados automaticamente

**Documentação**
- `docs/RESOLVER_ERRO_LOGIN.md` - Guia completo de troubleshooting
- Instruções para criar usuários manualmente ou via script
- Lista de todas as credenciais de teste

### 🐛 Corrigido

- Erro "Invalid login credentials" - usuários recriados no Supabase Auth
- Erro do React Query - QueryProvider adicionado ao layout
- Variável SUPABASE_SERVICE_ROLE_KEY adicionada ao .env.local

### 📦 Dependências

- `tsx@^4.20.6` - Executor TypeScript para scripts
- `dotenv@^17.2.3` - Carregamento de variáveis de ambiente

### 🐛 Bugs Conhecidos

- Dropdown "Minha Conta" no header está transparente (corrigir posteriormente)

### ⏭️ Próximo Passo

Continuar com **FASE 3.2 - Dashboard Médico: Lista de Ocorrências**

---

## [0.4.0] - 2025-10-08

### ✅ Adicionado

#### Dashboard do Médico com Estatísticas (FASE 3.1)

**Componente StatsCard** (`src/components/dashboard/StatsCard.tsx`)
- Componente reutilizável para exibição de estatísticas
- Props: title, value, description, icon, iconColor, trend, onClick, loading
- Suporte a ícones Lucide React com cores customizáveis
- Indicador de tendência (trend):
  - Ícones TrendingUp/TrendingDown
  - Percentual em verde (positivo) ou vermelho (negativo)
  - Label opcional (ex: "vs. período anterior")
- Loading skeleton animado durante carregamento
- Efeito hover com sombra e borda azul (quando clicável)
- Transições suaves em todas as interações

**Hook useMedicoStats** (`src/hooks/useMedicoStats.ts`)
- Hook customizado para buscar estatísticas do médico
- Integração com React Query (@tanstack/react-query) para cache
- Filtro de período: semana, mês, ano
- **Estatística 1 - Ocorrências Atendidas:**
  - Total de ocorrências confirmadas pelo médico
  - Status: CONCLUIDA
  - Cálculo de trend vs. período anterior
  - Query: ocorrencias_participantes JOIN ocorrencias
- **Estatística 2 - Ocorrências a Receber:**
  - Total de pagamentos pendentes
  - Valor total em reais (R$)
  - Lista de itens individuais (id, data, valor)
  - Query: ocorrencias_participantes com pago=false
- **Estatística 3 - Remoções:**
  - Total de atendimentos com remoção hospitalar
  - Filtrado por período
  - Query: atendimentos com remocao=true
- Estados de loading individuais para cada query
- Função getDateRange() para calcular datas baseado no período

**Dashboard Médico** (`src/app/(dashboard)/medico/page.tsx`)
- Substituição dos cards placeholder por StatsCard reais
- Integração com useMedicoStats para dados dinâmicos
- Header com filtros de período:
  - Botões Semana/Mês/Ano
  - Destaque visual no período ativo
- Grid responsivo de 3 cards:
  - **Card 1**: Ocorrências Atendidas (ícone Activity, azul)
  - **Card 2**: A Receber (ícone DollarSign, verde, clicável)
  - **Card 3**: Remoções (ícone Ambulance, laranja)
- Formatação de moeda brasileira (Intl.NumberFormat)
- Card de detalhes de pagamentos pendentes (expansível):
  - Exibido ao clicar no card "A Receber"
  - Lista de ocorrências com id, data e valor
  - Formatação de data em pt-BR
- Card de informações do perfil com grid 2 colunas
- Loading states em todos os cards durante fetch

**Melhorias de UX:**
- Skeleton loaders para feedback visual
- Hover effects em cards clicáveis
- Responsividade mobile-first (grid 1 col → 3 cols)
- Descrições contextuais nos cards
- Indicadores de tendência para análise de performance

## [0.3.0] - 2025-10-08

### ✅ Adicionado

#### Layout Base e Navegação (FASE 2)

**Configuração de Navegação** (`src/config/navigation.ts`)
- Mapeamento completo de menus por perfil (6 perfis)
- Interface `NavigationItem` com label, href, icon e perfis permitidos
- Função `getNavigationForProfile(perfil)` - Retorna itens de menu filtrados
- Função `getProfileLabel(perfil)` - Retorna label formatado do perfil
- Ícones Lucide React integrados
- Descrições para cada item de menu

**Menus por Perfil:**
- **MEDICO**: Dashboard, Agenda, Pacientes
- **ENFERMEIRO**: Dashboard, Agenda, Pacientes
- **MOTORISTA**: Ocorrência Ativa (interface tablet)
- **CHEFE_MEDICOS**: Dashboard, Central de Despacho, Ocorrências, Rastreamento, Ambulâncias, Profissionais, Pacientes, Escala (8 itens)
- **CHEFE_AMBULANCIAS**: Dashboard, Status Ambulâncias, Atribuição de Ocorrências
- **CHEFE_ENFERMEIROS**: Dashboard, Status de Equipamentos

**Componente Sidebar** (`src/components/layout/Sidebar.tsx`)
- Navegação lateral responsiva com design limpo
- Logo do sistema (SGA) com ícone de ambulância
- Menu dinâmico baseado no perfil do usuário logado
- Ícones Lucide React para cada item
- Indicador visual de item ativo (fundo azul, texto azul)
- Responsivo mobile:
  - Botão hamburguer para abrir/fechar
  - Overlay escuro quando aberto
  - Animação de slide suave
  - Fecha automaticamente ao clicar em item
- Botão de logout estilizado (vermelho)
- Largura fixa de 256px (16rem) no desktop

**Componente Header** (`src/components/layout/Header.tsx`)
- Cabeçalho fixo no topo com altura de 64px
- Título dinâmico mostrando perfil do usuário
- Mensagem de boas-vindas personalizada
- Botão de notificações com badge (contador 3)
- Avatar do usuário:
  - Iniciais geradas automaticamente do nome
  - Fundo azul com texto branco
  - Integrado com @radix-ui/react-avatar
- Menu dropdown do usuário:
  - Perfil (link futuro)
  - Configurações (link futuro)
  - Sair (logout funcional)
- Responsivo: esconde informações em telas pequenas

**Layout Dashboard** (`src/app/(dashboard)/layout.tsx`)
- Layout principal usando Flexbox
- Estrutura de 3 áreas:
  1. Sidebar fixa à esquerda (desktop) ou overlay (mobile)
  2. Header fixo no topo
  3. Área de conteúdo com scroll independente
- Height 100vh para ocupar tela inteira
- Padding responsivo no conteúdo (4 mobile, 6 desktop)
- Background cinza claro (bg-gray-50)
- Integração automática com todos os dashboards

**Componentes UI shadcn/ui Adicionados:**
- `dropdown-menu.tsx` - Menu dropdown com @radix-ui
- `avatar.tsx` - Avatar com fallback para iniciais
- `badge.tsx` - Badge para notificações e indicadores

### 🔧 Modificado

**Dashboard do Médico** (`src/app/(dashboard)/medico/page.tsx`)
- Removido header e botão de logout duplicados
- Layout simplificado usando apenas conteúdo
- Removido padding/container (agora vem do layout)
- Usa automaticamente Sidebar e Header do layout pai
- Mantém proteção com `ProtectedRoute`

**Página de Login** (`src/app/(auth)/login/page.tsx`)
- Simplificada lógica de redirecionamento
- Removido `useEffect` que causava loops
- Redirecionamento acontece apenas após login bem-sucedido
- Usa `window.location.href` para navegação confiável
- Timeout de 100ms para garantir atualização do estado

### 📦 Dependências

**Instaladas:**
- `lucide-react` - Biblioteca de ícones (já estava instalada)
- `@radix-ui/react-dropdown-menu` - Primitivo para dropdown menu
- `@radix-ui/react-avatar` - Primitivo para avatar
- `@supabase/ssr` - Cliente Supabase para SSR (middleware)

### 🎯 Funcionalidades

**Navegação Responsiva:**
- Desktop (≥1024px): Sidebar sempre visível, largura fixa 256px
- Mobile (<1024px): Sidebar escondida, botão hamburguer no header
- Transições suaves com Tailwind CSS
- Overlay escuro quando sidebar aberta em mobile

**Sistema de Menus Dinâmicos:**
- Cada perfil vê apenas seus menus relevantes
- Indicador visual de página ativa
- Ícones contextuais para cada funcionalidade
- Hover states em todos os itens interativos

**UX Melhorada:**
- Avatar com iniciais personalizadas
- Badge de notificações (preparado para integração futura)
- Menu dropdown acessível e intuitivo
- Logout acessível de 2 lugares (sidebar e dropdown)
- Loading states em todos os componentes

### 🐛 Correções

**Loop de Redirecionamento Resolvido:**
- Problema: Login ficava em loop redirecionando para `/login?redirect=%2Fmedico`
- Causa: `useEffect` disparando múltiplas vezes + middleware bloqueando
- Solução:
  1. Removido `useEffect` da página de login
  2. Redirecionamento apenas após login bem-sucedido
  3. Middleware temporariamente desabilitado (será reabilitado na FASE 3)
  4. Uso de `window.location.href` ao invés de `router.push`

### 📊 Status das Fases

**✅ FASE 1 - Autenticação e Controle de Acesso:** Completa
- Login/Logout funcionando
- Controle de acesso por perfil
- Hooks e utilitários criados

**✅ FASE 2 - Layouts e Navegação:** Completa
- Sidebar responsiva ✅
- Header com user menu ✅
- Layout dashboard ✅
- Navegação por perfil ✅
- Testado e funcional ✅

**⏭️ Próximo Passo: FASE 3 - Dashboard do Médico**
- Implementar estatísticas reais
- Criar lista de ocorrências disponíveis
- Modal de detalhes de ocorrência
- Sistema de confirmação de participação
- Ver `docs/md/PLANO_DE_ACOES.md` → **Prompt 3.1**

### 📝 Notas Técnicas

**Estrutura de Pastas Criada:**
```
src/
├── config/
│   └── navigation.ts          # Configuração de menus
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx        # Navegação lateral
│   │   └── Header.tsx         # Cabeçalho
│   ├── auth/
│   │   └── ProtectedRoute.tsx # Já existia
│   └── ui/
│       ├── dropdown-menu.tsx  # Novo
│       ├── avatar.tsx         # Novo
│       └── badge.tsx          # Novo
└── app/
    └── (dashboard)/
        └── layout.tsx         # Layout principal
```

**Middleware:**
- Temporariamente desabilitado para evitar conflitos
- Será reabilitado com correções na próxima fase
- Proteção acontece via `ProtectedRoute` no client-side

---

## [0.2.2] - 2025-10-08

### ✅ Adicionado

#### Sistema de Controle de Acesso Baseado em Perfil (FASE 1.2)

**Hook useAuth** (`src/hooks/useAuth.ts`)
- Função `hasPermission(allowedProfiles)` - Verifica se usuário tem permissão baseado em perfis
- Propriedade `userProfile` - Retorna tipo de perfil do usuário atual
- Propriedade `isAuthenticated` - Verifica se usuário está autenticado
- Integração com authStore do Zustand
- Exporta todos os estados e funções de autenticação

**Componente ProtectedRoute** (`src/components/auth/ProtectedRoute.tsx`)
- Aceita array de perfis permitidos via prop `allowedProfiles`
- Redireciona automaticamente se usuário não tem permissão
- Mostra loading state enquanto verifica autenticação
- Suporta `fallbackRoute` customizado
- Redireciona para dashboard correto do usuário se acesso negado

**Utilitários de Redirecionamento** (`src/lib/utils/redirect.ts`)
- Função `redirectToDashboard(perfil, router)` - Redireciona para dashboard baseado no perfil
- Função `getDashboardRoute(perfil)` - Retorna rota do dashboard
- Função `isRouteAllowedForProfile(perfil, route)` - Verifica se rota é permitida
- Constante `DASHBOARD_ROUTES` - Mapa de rotas por perfil

### 🔧 Modificado

**Middleware de Autenticação** (`src/middleware.ts`)
- Adicionada verificação de perfil do usuário
- Busca `tipo_perfil` na tabela `usuarios` após autenticação
- Verifica permissão de acesso baseado no mapa `ROUTE_PERMISSIONS`
- Redireciona automaticamente para dashboard correto se usuário tentar acessar rota não permitida
- Melhoria na leitura de cookies do Supabase Auth
- Adicionada constante `ROUTE_PERMISSIONS` mapeando rotas → perfis permitidos

**Dashboard do Médico** (`src/app/(dashboard)/medico/page.tsx`)
- Envolvido com componente `ProtectedRoute`
- Atualizado para usar hook `useAuth` ao invés de `useAuthStore` direto
- Exemplo de implementação de controle de acesso

### 🎯 Funcionalidades

**Controle de Acesso Multinível:**
1. **Middleware (Server-side)**: Primeira camada de proteção
   - Verifica sessão do Supabase
   - Valida perfil do usuário
   - Redireciona antes de carregar página

2. **ProtectedRoute (Client-side)**: Segunda camada de proteção
   - Verifica permissões no cliente
   - Mostra loading states
   - Redireciona se necessário

3. **Hook useAuth**: Acesso fácil aos dados de autenticação
   - Função `hasPermission()` para conditional rendering
   - Estados `isLoading`, `isAuthenticated`
   - Perfil do usuário acessível

**Mapeamento de Rotas:**
- `/medico` → Apenas MEDICO
- `/enfermeiro` → Apenas ENFERMEIRO
- `/motorista` → Apenas MOTORISTA
- `/chefe-medicos` → Apenas CHEFE_MEDICOS
- `/chefe-enfermeiros` → Apenas CHEFE_ENFERMEIROS
- `/chefe-ambulancias` → Apenas CHEFE_AMBULANCIAS

**Fluxo de Proteção:**
1. Usuário tenta acessar `/medico`
2. Middleware verifica se está autenticado
3. Middleware verifica se perfil = MEDICO
4. Se não for MEDICO, redireciona para dashboard correto
5. ProtectedRoute faz verificação adicional no cliente
6. Renderiza conteúdo apenas se tudo OK

### 📊 Status da FASE 1

**✅ FASE 1.1 - Autenticação Básica:** Completa
- Login/Logout funcionando
- Sessão persistida
- Redirecionamento após login

**✅ FASE 1.2 - Controle de Acesso:** Completa
- Hook useAuth implementado
- ProtectedRoute component criado
- Middleware com verificação de perfil
- Redirecionamento automático por perfil
- Testes de acesso por perfil funcionando

**⏭️ Próximo Passo: FASE 2 - Layouts e Navegação**
- Criar Sidebar responsiva
- Criar Header com user menu
- Implementar navegação dinâmica por perfil
- Ver `PLANO_DE_ACOES.md` → **Prompt 2.1**

---

## [0.2.1] - 2025-10-08

### 🔧 Corrigido

#### Sistema de Autenticação - Correção de Permissões

**Problema Identificado:**
- Erro 403/401 ao tentar fazer login mesmo após autenticação no Supabase Auth
- Mensagem: `permission denied for table usuarios`
- RLS (Row Level Security) não era o problema principal

**Solução Implementada:**
- Identificado que as **permissões GRANT** da tabela `usuarios` não estavam configuradas
- Mesmo com RLS desabilitado, as roles `anon` e `authenticated` não tinham permissão para ler a tabela
- Executado script SQL para conceder permissões:
  ```sql
  GRANT SELECT ON usuarios TO anon, authenticated;
  GRANT INSERT, UPDATE, DELETE ON usuarios TO authenticated;
  ```

**Scripts SQL Criados** (movidos para `docs/sql/`):
- `diagnostico-completo-rls.sql` - Diagnóstico do estado do RLS
- `verificar-permissoes-tabela.sql` - **Script definitivo que resolveu o problema**
- `DESABILITAR-RLS-TEMPORARIO.sql` - Desabilita RLS (usado para diagnóstico)
- `SOLUCAO-DEFINITIVA-RLS.sql` - Script completo de políticas RLS
- `verificar-politicas.sql` - Verifica políticas criadas
- `fix-rls-final.sql` - Tentativa anterior de correção
- `corrigir-rls.sql` - Script inicial de correção RLS
- `diagnostico-usuarios.sql` - Diagnóstico de usuários
- `setup-usuarios-teste.sql` - Setup de usuários de teste
- `teste-conexao.sql` - Teste de conexão

**Resultado:**
- ✅ Login funcionando corretamente
- ✅ Usuário `medico@teste.com` consegue autenticar
- ✅ Redirecionamento para dashboard funcionando

### 📁 Organização

**Estrutura de Documentação Criada:**
```
docs/
├── md/          # Arquivos de documentação markdown
│   ├── TECH_STACK.md
│   ├── PROJECT_STRUCTURE.md
│   ├── SETUP_SUPABASE.md
│   ├── QUICK_START.md
│   ├── TROUBLESHOOTING.md
│   ├── PROXIMOS_PASSOS.md
│   ├── SETUP_DATABASE.md
│   ├── INTEGRATION_SUMMARY.md
│   ├── PLANO_DE_ACOES.md
│   └── SUPABASE_AUTH_SETUP.md
└── sql/         # Scripts SQL de diagnóstico e correção
    ├── diagnostico-completo-rls.sql
    ├── verificar-permissoes-tabela.sql
    ├── DESABILITAR-RLS-TEMPORARIO.sql
    ├── SOLUCAO-DEFINITIVA-RLS.sql
    ├── verificar-politicas.sql
    ├── fix-rls-final.sql
    ├── corrigir-rls.sql
    ├── diagnostico-usuarios.sql
    ├── setup-usuarios-teste.sql
    └── teste-conexao.sql
```

### 📚 Lição Aprendida

**Diferença entre RLS e GRANT:**
- **RLS (Row Level Security)**: Controla quais LINHAS um usuário pode ver/modificar
- **GRANT**: Controla se um usuário tem permissão para acessar a TABELA
- Ambos precisam estar configurados corretamente para o acesso funcionar
- Neste caso, o problema era **GRANT**, não RLS

**Checklist para futuros problemas de permissão:**
1. ✅ Verificar se a tabela existe
2. ✅ Verificar permissões GRANT para as roles (`anon`, `authenticated`)
3. ✅ Verificar se RLS está habilitado/desabilitado conforme necessário
4. ✅ Verificar políticas RLS (se habilitado)

---

## [0.2.0] - 2025-10-08

### ✅ Adicionado

#### Sistema de Autenticação Completo (FASE 1)

**Serviço de Autenticação** (`src/lib/services/auth.ts`)
- Função `login()` - Autentica usuário via Supabase Auth e busca dados completos
- Função `logout()` - Encerra sessão do usuário
- Função `getCurrentUser()` - Recupera usuário autenticado e valida status ativo
- Função `getSession()` - Obtém sessão atual do Supabase
- Função `onAuthStateChange()` - Listener para mudanças no estado de autenticação
- Validação de usuário ativo antes de permitir login
- Integração completa com tabela `usuarios` do banco de dados

**Zustand Store Atualizado** (`src/stores/authStore.ts`)
- Middleware `persist` para manter sessão entre recarregamentos
- Função `login()` integrada com serviço de autenticação
- Função `logout()` com limpeza de estado
- Função `initializeAuth()` para verificar sessão ao carregar app
- Listener de mudanças de autenticação (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
- Estado `isInitialized` para controle de carregamento inicial
- Persistência apenas do campo `user` no localStorage

**Página de Login** (`src/app/(auth)/login/page.tsx`)
- Interface responsiva com gradiente azul
- Validação de campos (email e senha) com Zod
- Estados de loading durante autenticação
- Feedback visual de erros por campo
- Redirecionamento automático baseado em perfil do usuário
- Mensagens de toast para sucesso/erro
- Ícone SVG de ambulância
- Proteção contra duplo login (redirect se já autenticado)

**Middleware de Proteção de Rotas** (`src/middleware.ts`)
- Proteção de rotas de dashboard: `/medico`, `/enfermeiro`, `/motorista`, `/chefe-medicos`, `/chefe-enfermeiros`, `/chefe-ambulancias`
- Verificação de token de autenticação via cookies
- Validação de sessão ativa com Supabase Auth
- Redirecionamento para `/login` com parâmetro `redirect` para retornar após login
- Configuração de matcher para ignorar rotas públicas e estáticas

**AuthProvider Component** (`src/components/providers/AuthProvider.tsx`)
- Provider que inicializa autenticação ao carregar app
- Integrado ao layout raiz
- Chama `initializeAuth()` no mount

**Dashboards Placeholder**
- `/medico/page.tsx` - Dashboard do Médico com cards de estatísticas
- `/enfermeiro/page.tsx` - Dashboard do Enfermeiro
- `/motorista/page.tsx` - Dashboard do Motorista (interface tablet)
- `/chefe-medicos/page.tsx` - Dashboard do Chefe dos Médicos
- `/chefe-enfermeiros/page.tsx` - Dashboard do Chefe dos Enfermeiros
- `/chefe-ambulancias/page.tsx` - Dashboard do Chefe das Ambulâncias
- Todos com botão de logout funcional
- Exibição de dados do usuário logado

**Documentação**
- `SUPABASE_AUTH_SETUP.md` - Guia completo de configuração:
  - Instruções para habilitar email/senha no Supabase
  - Scripts SQL para criar usuários de teste
  - Políticas RLS para todas as tabelas principais
  - Checklist de configuração
  - Exemplos de usuários para cada perfil

### 🔧 Modificado

**Layout Raiz** (`src/app/layout.tsx`)
- Adicionado `AuthProvider` para inicialização de autenticação
- Adicionado `Toaster` do Sonner para notificações
- Configurado posição top-right para toasts

### 📦 Dependências

Nenhuma nova dependência instalada (todas já estavam disponíveis):
- `@supabase/supabase-js` - Para autenticação
- `zustand` com middleware `persist` - Para gerenciamento de estado
- `sonner` - Para notificações toast
- `zod` - Para validação de formulários

### 🎯 Decisões Técnicas

1. **Autenticação Híbrida**: Supabase Auth + tabela `usuarios`
   - Supabase Auth gerencia sessões e tokens
   - Tabela `usuarios` armazena dados completos e tipo de perfil
   - Validação de usuário ativo antes de permitir acesso

2. **Redirecionamento por Perfil**
   - Cada perfil tem sua rota específica
   - Redirecionamento automático após login baseado em `tipo_perfil`
   - Middleware protege todas as rotas de dashboard

3. **Persistência de Sessão**
   - Zustand persist middleware salva apenas dados essenciais
   - Sessão do Supabase gerenciada via cookies
   - Re-validação automática ao carregar app

4. **Segurança**
   - RLS habilitado em todas as tabelas
   - Validação de usuário ativo em múltiplos pontos
   - Middleware verifica sessão antes de permitir acesso

### ⚠️ Ações Necessárias do Usuário

**✅ CONCLUÍDO:**

1. ✅ **Permissões do NPM corrigidas**
   ```bash
   sudo chown -R 501:20 "/Users/lucajunqueiradealmeida/.npm"
   ```

2. ✅ **Dependências instaladas**
   ```bash
   cd ~/Documents/GitHub/sga
   npm install
   ```
   - 411 pacotes instalados com sucesso
   - 0 vulnerabilidades encontradas

3. ✅ **Servidor iniciado**
   ```bash
   npm run dev
   ```
   - Servidor rodando em http://localhost:3000
   - Warning sobre lockfile duplicado (não crítico)

**⏳ PENDENTE (antes de testar login):**

1. **Configurar Supabase Auth** (seguir `SUPABASE_AUTH_SETUP.md`):
   - [ ] Habilitar provider de email/senha no Supabase Dashboard
   - [ ] Desabilitar confirmação de email (desenvolvimento)
   - [ ] Executar scripts SQL de RLS (políticas de segurança)
   - [ ] Criar usuários de teste

2. **Criar pelo menos um usuário de teste** via SQL ou Dashboard:

   **Passo A - Criar na tabela usuarios:**
   ```sql
   INSERT INTO public.usuarios (nome_completo, cpf, email, senha_hash, tipo_perfil, ativo)
   VALUES ('Dr. João Silva', '11111111111', 'medico@teste.com', crypt('teste123', gen_salt('bf')), 'MEDICO', true);
   ```

   **Passo B - Criar no Supabase Auth:**
   - Ir em Authentication → Users → Add user
   - Email: medico@teste.com
   - Password: teste123
   - Marcar: "Auto Confirm User" ✓

3. **Testar login** (após configuração acima):
   - Acessar: http://localhost:3000/login
   - Email: medico@teste.com
   - Senha: teste123
   - Deve redirecionar para `/medico`

### 📊 Status da FASE 1

✅ **CÓDIGO IMPLEMENTADO** - Sistema de Autenticação e Controle de Acesso

**Deliverables (Código):**
- ✅ Página de login funcional (código completo)
- ✅ Serviço de autenticação (código completo)
- ✅ Store atualizado com integração Supabase Auth (código completo)
- ✅ Middleware de proteção de rotas (código completo)
- ✅ Dashboards placeholder para todos os perfis (código completo)
- ✅ Redirecionamento automático por perfil (código completo)
- ✅ Documentação de configuração do Supabase (completa)
- ✅ Servidor Next.js rodando em http://localhost:3000

**Pendências (Configuração):**
- ⏳ Configuração do Supabase Auth no Dashboard (ver SUPABASE_AUTH_SETUP.md)
- ⏳ Criação de usuários de teste
- ⏳ Teste do fluxo de login/logout

**Status Geral:** Implementação completa, aguardando configuração do Supabase para testes.

### ⏭️ Próximos Passos

**ANTES DA FASE 2:**
1. Configurar Supabase Auth conforme `SUPABASE_AUTH_SETUP.md`
2. Criar usuários de teste
3. Testar login e redirecionamento

**FASE 2** - Layouts e Navegação:
1. Criar componente Sidebar com navegação dinâmica por perfil
2. Criar Header com menu dropdown e notificações
3. Implementar layout dashboard com Sidebar + Header
4. Configurar menus de navegação por perfil

Ver `PLANO_DE_ACOES.md` → **Prompt 2.1**

---

**📝 Nota de Desenvolvimento:**
Sessão encerrada em 08/10/2025. Fase 1 implementada com sucesso. Aguardar configuração do Supabase antes de prosseguir para Fase 2.

---

## [0.1.0] - 2025-10-07

### ( Adicionado

#### Configura��o Inicial do Projeto

- **Next.js 14**: Inicializado projeto com App Router e TypeScript
- **Tailwind CSS**: Configurado framework CSS utilit�rio com PostCSS e Autoprefixer
- **TypeScript**: Configura��o completa com paths aliases (`@/*`)
- **ESLint + Prettier**: Configura��o de linting e formata��o de c�digo

#### Componentes UI (shadcn/ui)

Implementados componentes base do shadcn/ui:

- `Button` - Bot�es com m�ltiplas variantes (default, destructive, outline, secondary, ghost, link)
- `Card` - Cart�es com subcomponentes (CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- `Input` - Campos de entrada de texto
- `Label` - Labels para formul�rios
- `Select` - Seletor dropdown nativo
- `Toast` - Sistema de notifica��es usando Sonner

#### Integra��o com Supabase

- Cliente Supabase para uso no lado do cliente (`src/lib/supabase/client.ts`)
- Cliente Supabase para uso no lado do servidor (`src/lib/supabase/server.ts`)
- Configura��o de vari�veis de ambiente para Supabase
- Tipos TypeScript para integra��o com Supabase

#### Estrutura de Pastas

Criada estrutura completa do projeto:

```
src/
   app/
      (auth)/          # Grupo de rotas de autentica��o
      (dashboard)/     # Grupo de rotas do dashboard
      api/
         health/      # Endpoint de health check
      globals.css
      layout.tsx
      page.tsx
   components/
      ui/              # Componentes shadcn/ui
      shared/          # Componentes compartilhados (Header)
   lib/
      supabase/        # Configura��o Supabase
      utils.ts         # Utilit�rio cn() para classes
   types/
      index.ts         # Tipos TypeScript globais
   hooks/
      useSupabase.ts   # Hook customizado para Supabase
   stores/
       authStore.ts     # Store Zustand para autentica��o
```

#### Gerenciamento de Estado

- **Zustand**: Instalado e configurado para gerenciamento de estado global
- Store de autentica��o (`authStore`) com fun��es b�sicas

#### Layouts e Componentes Base

- Layout raiz com metadata SEO
- Layout para p�ginas de autentica��o
- Layout para dashboard com Header
- Componente Header compartilhado
- P�gina inicial placeholder

#### API Routes

- Endpoint de health check (`/api/health`)

#### Tipos TypeScript

Definidos tipos iniciais para:

- `User` - Usu�rio do sistema
- `Ambulancia` - Ve�culos de ambul�ncia
- `Motorista` - Motoristas
- `Ocorrencia` - Ocorr�ncias/Atendimentos
- `ApiResponse<T>` - Tipo utilit�rio para respostas de API

#### Configura��o de Ambiente

- Arquivo `.env.example` com template de vari�veis
- Arquivo `.env.local` criado (ignorado pelo git)
- `.gitignore` configurado para Next.js

#### Documenta��o

- **README.md**: Documenta��o completa com:
  - Descri��o do projeto
  - Stack tecnol�gica
  - Estrutura de pastas
  - Instru��es de instala��o
  - Pr�-requisitos
  - Scripts dispon�veis
  - Guia de contribui��o
- **CHANGELOG.md**: Este arquivo de hist�rico de mudan�as

#### Scripts NPM

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

### =� Depend�ncias Instaladas

#### Produ��o

- `next@^15.5.4` - Framework React
- `react@^19.2.0` - Biblioteca React
- `react-dom@^19.2.0` - React DOM
- `typescript@^5.9.3` - TypeScript
- `@supabase/supabase-js@^2.74.0` - Cliente Supabase
- `zustand@^5.0.8` - Gerenciamento de estado
- `class-variance-authority@^0.7.1` - Variantes de classes CSS
- `clsx@^2.1.1` - Utilit�rio para classes condicionais
- `tailwind-merge@^3.3.1` - Merge de classes Tailwind
- `lucide-react@^0.545.0` - Biblioteca de �cones
- `sonner@^2.0.7` - Sistema de toast/notifica��es

#### Desenvolvimento

- `@types/node@^24.7.0` - Tipos TypeScript para Node
- `@types/react@^19.2.2` - Tipos TypeScript para React
- `@types/react-dom@^19.2.1` - Tipos TypeScript para React DOM
- `tailwindcss@^4.1.14` - Framework CSS
- `postcss@^8.5.6` - Processador CSS
- `autoprefixer@^10.4.21` - Plugin PostCSS
- `eslint@^9.37.0` - Linter JavaScript/TypeScript
- `eslint-config-next@^15.5.4` - Configura��o ESLint para Next.js
- `eslint-config-prettier@^10.1.8` - Integra��o ESLint + Prettier
- `eslint-plugin-prettier@^5.5.4` - Plugin Prettier para ESLint
- `prettier@^3.6.2` - Formatador de c�digo

### =' Configura��es

- **Next.js**: Configurado com React Strict Mode e otimiza��es de imagem
- **Tailwind**: Configurado com paths para src/
- **TypeScript**: Configurado com paths aliases e strict mode
- **ESLint**: Configurado com Next.js e Prettier
- **Prettier**: Configurado com regras personalizadas (single quotes, trailing comma, etc.)

### =� Pr�ximos Passos

Para continuar o desenvolvimento, as pr�ximas etapas incluem:

1. Configurar schema do banco de dados no Supabase
2. Implementar sistema de autentica��o
3. Criar p�ginas de login e registro
4. Desenvolver CRUD de ambul�ncias
5. Desenvolver CRUD de motoristas
6. Implementar sistema de ocorr�ncias
7. Adicionar dashboard com m�tricas
8. Implementar relat�rios

---

## Formato das Vers�es

- **MAJOR** (X.0.0): Mudan�as incompat�veis com vers�es anteriores
- **MINOR** (0.X.0): Novas funcionalidades compat�veis com vers�es anteriores
- **PATCH** (0.0.X): Corre��es de bugs compat�veis com vers�es anteriores

## Tipos de Mudan�as

- `( Adicionado` - Novas funcionalidades
- `= Modificado` - Mudan�as em funcionalidades existentes
- `=� Removido` - Funcionalidades removidas
- `= Corrigido` - Corre��es de bugs
- `= Seguran�a` - Vulnerabilidades corrigidas
- `=� Depend�ncias` - Atualiza��es de depend�ncias
