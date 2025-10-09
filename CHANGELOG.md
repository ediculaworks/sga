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
