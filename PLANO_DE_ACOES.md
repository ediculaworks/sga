# 📋 PLANO DE AÇÕES - SISTEMA DE GESTÃO DE AMBULÂNCIAS

**Data de Criação:** 07 de Outubro de 2025
**Status Atual:** Banco de dados integrado ✅ | Frontend pendente ⏳
**Servidor:** http://localhost:3000 (rodando)

---

## 🎯 OBJETIVO

Desenvolver sequencialmente todas as funcionalidades do Sistema de Gestão de Ambulâncias seguindo as especificações documentadas em `Init/contexto.txt` e `claude.md`.

---

## ✅ SITUAÇÃO ATUAL (CONCLUÍDO)

### FASE 0: Infraestrutura e Database
- [x] Projeto Next.js 14 inicializado com TypeScript
- [x] Tailwind CSS configurado
- [x] shadcn/ui instalado (componentes base)
- [x] Supabase conectado e configurado
- [x] **Schema do banco de dados completo (23 tabelas, 7 enums, 14 triggers, 5 views)**
- [x] **Tipos TypeScript completos (~540 linhas)**
- [x] **Serviços CRUD completos (5 services)**
- [x] **Hooks React personalizados (3 hooks)**
- [x] **Utilitários (validação, formatação, queries)**
- [x] Estrutura de pastas criada
- [x] ESLint + Prettier configurados

---

## 🚀 CRONOGRAMA DE DESENVOLVIMENTO

---

## **FASE 1: AUTENTICAÇÃO E CONTROLE DE ACESSO**

### Objetivo
Implementar sistema completo de autenticação com Supabase Auth e controle de acesso baseado em perfis.

### 📝 Prompt 1.1 - Sistema de Login

```
TAREFA: Implementar Sistema de Autenticação com Supabase Auth

CONTEXTO:
- Projeto: Sistema de Gestão de Ambulâncias
- Database: 6 perfis de usuário (MEDICO, ENFERMEIRO, MOTORISTA, CHEFE_MEDICOS, CHEFE_ENFERMEIROS, CHEFE_AMBULANCIAS)
- Stack: Next.js 14 + Supabase + TypeScript
- Tipos já criados em src/types/index.ts

REQUISITOS:

1. Configurar Supabase Auth
   - Habilitar autenticação por email/senha no Supabase Dashboard
   - Configurar RLS (Row Level Security) básico

2. Criar página de Login: src/app/(auth)/login/page.tsx
   - Formulário com email e senha
   - Validação com Zod
   - Loading states
   - Tratamento de erros
   - Usar componentes shadcn/ui (Card, Input, Button, Label)

3. Criar serviço de autenticação: src/lib/services/auth.ts
   - login(email, password)
   - logout()
   - getCurrentUser()
   - getSession()

4. Atualizar authStore (Zustand): src/stores/authStore.ts
   - Integrar com Supabase Auth
   - Persistir sessão
   - Tipos corretos (Usuario do banco)

5. Criar middleware de proteção: src/middleware.ts
   - Proteger rotas (dashboard)
   - Redirecionar não autenticados para /login

DELIVERABLES:
- [ ] Página de login funcional
- [ ] Serviço de autenticação
- [ ] Store atualizado
- [ ] Middleware de proteção
- [ ] Testes manuais de login/logout

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
- Adicionar comentários no código
```

### 📝 Prompt 1.2 - Controle de Acesso por Perfil

```
TAREFA: Implementar Controle de Acesso Baseado em Perfil

CONTEXTO:
- 6 perfis diferentes no sistema
- Cada perfil tem dashboard e funcionalidades específicas
- Usuário logado tem campo tipo_perfil

REQUISITOS:

1. Criar hook useAuth: src/hooks/useAuth.ts
   - Retorna usuário atual
   - Retorna tipo de perfil
   - Função hasPermission(perfis: TipoPerfil[])
   - Loading state

2. Criar componente ProtectedRoute: src/components/auth/ProtectedRoute.tsx
   - Aceita array de perfis permitidos
   - Redireciona se usuário não tem permissão
   - Mostra loading enquanto verifica

3. Criar função de redirecionamento por perfil: src/lib/utils/redirect.ts
   - redirectToDashboard(perfil: TipoPerfil)
   - Redireciona cada perfil para seu dashboard específico

4. Atualizar middleware
   - Verificar tipo de perfil
   - Redirecionar para dashboard correto após login

DELIVERABLES:
- [ ] Hook useAuth funcional
- [ ] ProtectedRoute component
- [ ] Redirecionamento automático por perfil
- [ ] Testes de acesso por perfil

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

---

## **FASE 2: LAYOUTS E NAVEGAÇÃO**

### 📝 Prompt 2.1 - Layout Base e Sidebar

```
TAREFA: Criar Layout Base Responsivo com Navegação Lateral

CONTEXTO:
- Sistema com 6 perfis diferentes
- Cada perfil tem menu de navegação específico
- Layout deve ser responsivo (desktop e tablet)

REQUISITOS:

1. Criar componente Sidebar: src/components/layout/Sidebar.tsx
   - Navegação dinâmica baseada em perfil
   - Logo do sistema
   - Menu items com ícones (Lucide React)
   - Indicador de item ativo
   - Responsivo (collapsa em mobile)
   - Botão de logout

2. Criar Header: src/components/layout/Header.tsx
   - Nome do usuário e perfil
   - Avatar/iniciais
   - Notificações (badge de contagem)
   - Menu dropdown (perfil, configurações, sair)
   - Responsive (hamburguer em mobile)

3. Criar layout para dashboard: src/app/(dashboard)/layout.tsx
   - Sidebar + Header
   - Área de conteúdo principal
   - Adaptar conforme perfil logado

4. Criar arquivo de configuração de menus: src/config/navigation.ts
   - Menus por perfil
   - Estrutura: { label, href, icon, perfis[] }

PERFIS E MENUS:

MÉDICO:
- Dashboard
- Agenda
- Pacientes

ENFERMEIRO:
- Dashboard
- Agenda
- Pacientes

MOTORISTA (Tablet):
- Ocorrência Ativa

CHEFE DOS MÉDICOS:
- Dashboard
- Central de Despacho
- Ocorrências
- Rastreamento
- Ambulâncias
- Profissionais
- Pacientes
- Escala

CHEFE DAS AMBULÂNCIAS:
- Dashboard
- Status Ambulâncias
- Atribuição de Ocorrências

CHEFE DOS ENFERMEIROS:
- Dashboard
- Status de Equipamentos Médicos

DELIVERABLES:
- [ ] Sidebar responsivo
- [ ] Header com user menu
- [ ] Layout dashboard
- [ ] Navegação por perfil
- [ ] Testes em todos os perfis

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
- Adicionar screenshots
```

---

## **FASE 3: DASHBOARD DO MÉDICO**

### 📝 Prompt 3.1 - Dashboard Médico - Estrutura e Estatísticas

```
TAREFA: Criar Dashboard do Médico com Estatísticas

CONTEXTO:
- Perfil: MEDICO
- Página: /medico/dashboard
- Referência: Init/contexto.txt seção "PERFIL: MÉDICO"

REQUISITOS:

1. Criar página: src/app/(dashboard)/medico/page.tsx

2. Criar componente StatsCard: src/components/dashboard/StatsCard.tsx
   - Reutilizável para todos os perfis
   - Props: title, value, icon, trend (opcional)
   - Usar shadcn/ui Card

3. Implementar 3 cards de estatísticas:

   Card 1: Ocorrências Atendidas
   - Query: ocorrências do médico logado na semana
   - Mostrar total e comparação com semana anterior
   - Filtro: semana/mês/ano

   Card 2: Ocorrências a Receber
   - Query: participações não pagas (pago = false)
   - Ao clicar: mostrar lista com datas de pagamento
   - Total em R$

   Card 3: Remoções
   - Query: atendimentos com remocao = true
   - Período: semana/mês
   - Mostrar total

4. Usar services e hooks já criados:
   - useUsuario() para dados do médico
   - queries.getHistoricoProfissional()
   - Filtrar dados no client

DELIVERABLES:
- [ ] Dashboard médico funcional
- [ ] 3 cards de estatísticas
- [ ] Queries otimizadas
- [ ] Loading states
- [ ] Testes com dados mockados

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

### 📝 Prompt 3.2 - Dashboard Médico - Lista de Ocorrências

```
TAREFA: Implementar Lista de Ocorrências Disponíveis (Dashboard Médico)

CONTEXTO:
- Médico vê ocorrências em aberto para se inscrever
- Filtro automático: não mostrar se médico está de folga ou alocado
- Destaque visual para ocorrências confirmadas

REQUISITOS:

1. Criar componente OcorrenciaCard: src/components/ocorrencias/OcorrenciaCard.tsx
   - Props: ocorrencia, onSelect, variant (default | confirmed)
   - Mostrar: tipo, data, horário, local, vagas
   - Badge de status
   - Botão "Ver Detalhes"

2. Implementar filtro inteligente:
   - Buscar escala do médico
   - Verificar disponibilidade na data
   - Verificar conflito de horários
   - Usar query customizada ou filtro client-side

3. Seção de ocorrências disponíveis:
   - Grid responsivo de cards
   - Ordenar por data (mais próximas primeiro)
   - Separar "Confirmadas" das "Em Aberto"

4. Estados:
   - Loading skeleton
   - Empty state ("Nenhuma ocorrência disponível")
   - Error state

DELIVERABLES:
- [ ] OcorrenciaCard component
- [ ] Filtro de disponibilidade
- [ ] Lista funcional
- [ ] Estados de UI

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

### 📝 Prompt 3.3 - Modal de Detalhes da Ocorrência (Status EM_ABERTO)

```
TAREFA: Criar Modal de Detalhes da Ocorrência - Status "EM_ABERTO"

CONTEXTO:
- Modal reutilizável em múltiplos contextos
- Conteúdo varia conforme status e perfil
- Começar com status "EM_ABERTO" para médico

REQUISITOS:

1. Criar componente: src/components/ocorrencias/OcorrenciaDetalhesModal.tsx
   - Props: ocorrenciaId, isOpen, onClose, perfil (opcional)
   - Usar shadcn/ui Dialog
   - Responsivo

2. Para status "EM_ABERTO", mostrar:
   - Descrição da ocorrência
   - Local da ocorrência
   - Tipo de ocorrência (badge)
   - Tipo de ambulância (badge)
   - Funções na ocorrência:
     * Vagas em aberto (badge "Disponível")
     * Vagas preenchidas (nome + badge "Confirmado")
   - Horário de saída
   - Horário no local
   - Se evento: horário de término
   - Valor do pagamento
   - Data de pagamento

3. Ações no modal:
   - Botão "Confirmar Participação" (se há vaga para médico)
   - Botão "Cancelar" (fechar modal)

4. Criar serviço: confirmarParticipacao(ocorrenciaId, usuarioId)
   - Insert em ocorrencias_participantes
   - Atualizar lista após confirmação

DELIVERABLES:
- [ ] Modal de detalhes funcional
- [ ] Exibição correta de dados
- [ ] Confirmação de participação
- [ ] Feedback visual (toast)

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

---

## **FASE 4: AGENDA DO MÉDICO**

### 📝 Prompt 4.1 - Página de Agenda

```
TAREFA: Criar Página de Agenda do Médico

CONTEXTO:
- Visualização mensal de ocorrências confirmadas
- Integração com calendário
- Ao clicar em ocorrência: abrir modal de detalhes

REQUISITOS:

1. Criar página: src/app/(dashboard)/medico/agenda/page.tsx

2. Instalar biblioteca de calendário:
   - React Big Calendar ou FullCalendar
   - Ou criar calendário custom com Tailwind

3. Buscar ocorrências do médico:
   - Query: ocorrências_participantes WHERE usuario_id = medico
   - Join com ocorrencias
   - Filtrar por mês selecionado

4. Exibir no calendário:
   - Cada ocorrência como evento
   - Cor por status
   - Ao clicar: abrir OcorrenciaDetalhesModal

5. Controles:
   - Navegação mês anterior/próximo
   - Botão "Hoje"
   - Filtro por status (opcional)

DELIVERABLES:
- [ ] Página de agenda funcional
- [ ] Calendário com ocorrências
- [ ] Modal de detalhes integrado
- [ ] Navegação mensal

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

---

## **FASE 5: PACIENTES (MÉDICO E CHEFE DOS MÉDICOS)**

### 📝 Prompt 5.1 - Banco de Dados de Pacientes

```
TAREFA: Criar Página de Banco de Dados de Pacientes

CONTEXTO:
- Compartilhada por MEDICO e CHEFE_MEDICOS
- Tabela com busca e filtros
- Histórico de atendimentos por paciente

REQUISITOS:

1. Criar componente: src/components/pacientes/PacientesTable.tsx
   - Usar shadcn/ui Table
   - Paginação
   - Busca por nome
   - Filtros: data, médico, ocorrência

2. Colunas da tabela:
   - Nome
   - Idade
   - Sexo
   - Data último atendimento
   - Local
   - Médico que atendeu
   - Ocorrência
   - Queixa principal
   - Ação: botão "Ver Histórico"

3. Implementar busca e filtros:
   - Input de busca (debounced)
   - Filtro por data (date picker)
   - Filtro por médico (select)
   - Aplicar filtros via query ou client-side

4. Paginação:
   - 20 itens por página
   - Navegação (anterior/próximo)
   - Indicador de páginas

DELIVERABLES:
- [ ] Tabela de pacientes
- [ ] Busca funcional
- [ ] Filtros funcionais
- [ ] Paginação

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

### 📝 Prompt 5.2 - Histórico do Paciente

```
TAREFA: Criar Modal de Histórico do Paciente

CONTEXTO:
- Expandir detalhes de um paciente
- Mostrar todos os atendimentos
- Visualizar prontuários e arquivos

REQUISITOS:

1. Criar componente: src/components/pacientes/PacienteHistoricoModal.tsx
   - Props: pacienteId, isOpen, onClose
   - Usar Dialog (shadcn/ui)

2. Seção de informações pessoais:
   - Nome completo
   - CPF, Data de nascimento, Idade
   - Sexo, Telefone
   - Endereço completo
   - Contato de emergência
   - Observações gerais

3. Lista de atendimentos:
   - Ordenar por data (mais recente primeiro)
   - Card por atendimento com:
     * Data
     * Ocorrência (link)
     * Médico
     * Queixa principal
     * Botão "Ver Prontuário"

4. Criar componente ProntuarioModal:
   - Dados completos do atendimento
   - Quadro clínico
   - Procedimentos realizados
   - Diagnóstico
   - Hospital destino (se remoção)
   - Arquivos anexados (imagens/documentos)
   - Notas de enfermeiros

DELIVERABLES:
- [ ] Modal de histórico
- [ ] Lista de atendimentos
- [ ] Modal de prontuário
- [ ] Visualização de arquivos

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

---

## **FASE 6: DASHBOARD DO ENFERMEIRO**

### 📝 Prompt 6.1 - Dashboard do Enfermeiro

```
TAREFA: Criar Dashboard do Enfermeiro

CONTEXTO:
- Similar ao dashboard do médico
- Mesmas estatísticas
- Mesma visualização de ocorrências
- Diferença: enfermeiro pode adicionar notas sobre pacientes

REQUISITOS:

1. Criar página: src/app/(dashboard)/enfermeiro/page.tsx

2. Reutilizar componentes do dashboard médico:
   - StatsCard
   - OcorrenciaCard
   - OcorrenciaDetalhesModal

3. Adaptar queries:
   - Filtrar por tipo_perfil = 'ENFERMEIRO'
   - Mesmas estatísticas (ocorrências, pagamentos, remoções)

4. Mesma funcionalidade:
   - Confirmação de participação
   - Visualização de ocorrências
   - Filtro de disponibilidade

DELIVERABLES:
- [ ] Dashboard do enfermeiro
- [ ] Reutilização de componentes
- [ ] Funcionalidades equivalentes

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

### 📝 Prompt 6.2 - Sistema de Notas sobre Pacientes (Enfermeiro)

```
TAREFA: Implementar Sistema de Notas do Enfermeiro

CONTEXTO:
- Durante ocorrência em andamento
- Enfermeiro pode adicionar notas sobre pacientes
- Notas ficam salvas no atendimento

REQUISITOS:

1. Adicionar ao OcorrenciaDetalhesModal (status EM_ANDAMENTO):
   - Se perfil = ENFERMEIRO
   - Lista de pacientes atendidos na ocorrência
   - Botão "Adicionar Nota" para cada paciente

2. Criar componente: src/components/enfermeiro/AdicionarNotaModal.tsx
   - Props: atendimentoId, pacienteNome, isOpen, onClose
   - Textarea para nota
   - Botão "Salvar Nota"

3. Serviço: salvarNotaEnfermeiro()
   - Insert em notas_enfermeiro_pacientes
   - Atualizar lista após salvar

4. Exibir notas no ProntuarioModal:
   - Seção "Notas de Enfermagem"
   - Lista com: data, enfermeiro, nota

DELIVERABLES:
- [ ] Modal de adicionar nota
- [ ] Serviço de salvar nota
- [ ] Exibição de notas no prontuário

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

---

## **FASE 7: DASHBOARD DO CHEFE DOS MÉDICOS**

### 📝 Prompt 7.1 - Dashboard com Estatísticas Gerais

```
TAREFA: Criar Dashboard do Chefe dos Médicos

CONTEXTO:
- Visão geral do sistema
- Estatísticas agregadas
- Avisos e alertas

REQUISITOS:

1. Criar página: src/app/(dashboard)/chefe-medicos/page.tsx

2. Cards de estatísticas:

   Card 1: Ambulâncias Ativas
   - Query: COUNT ambulancias WHERE status = 'EM_OPERACAO'

   Card 2: Profissionais Disponíveis
   - Query: vw_profissionais_disponiveis WHERE data = TODAY

   Card 3: Ocorrências Hoje
   - Query: ocorrencias WHERE data_ocorrencia = TODAY
   - Filtro: diário/semanal/mensal

   Card 4: Tempo Médio de Resposta
   - Query: AVG(duracao_total) de ocorrências concluídas
   - Período: semana/mês

3. Seção de Avisos:
   - Ambulâncias em manutenção
   - CNH de motoristas vencidas/próximas de vencer
   - Estoque baixo de equipamentos
   - Query: vw_estoque_baixo

4. Botão destacado: "Criar Nova Ocorrência"
   - Redireciona para /chefe-medicos/central-despacho

DELIVERABLES:
- [ ] Dashboard com estatísticas
- [ ] Seção de avisos
- [ ] Queries otimizadas

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

### 📝 Prompt 7.2 - Central de Despacho

```
TAREFA: Criar Página Central de Despacho (Criação de Ocorrências)

CONTEXTO:
- Chefe dos Médicos cria novas ocorrências
- Formulário complexo com validações
- Tipo de ambulância define vagas automaticamente

REQUISITOS:

1. Criar página: src/app/(dashboard)/chefe-medicos/central-despacho/page.tsx

2. Criar componente: src/components/ocorrencias/CriarOcorrenciaForm.tsx
   - Usar React Hook Form + Zod
   - Componentes shadcn/ui (Input, Select, Textarea, DatePicker)

3. Campos do formulário:
   - Tipo de ambulância (select: BASICA | EMERGENCIA)
     * Se BASICA: criar 1 vaga enfermeiro
     * Se EMERGENCIA: criar 1 vaga médico + 1 vaga enfermeiro
   - Quantidade adicional de enfermeiros (number)
   - Tipo de trabalho (select: EVENTO | DOMICILIAR | EMERGENCIA | TRANSFERENCIA)
   - Data (date picker)
   - Local da ocorrência (text)
   - Endereço completo (text)
   - Coordenadas GPS (opcional, text)
   - Horário de saída (time)
   - Horário no local (time)
   - Se EVENTO: horário de término (time)
   - Descrição (textarea)
   - Pagamento por função (valores por médico/enfermeiro)
   - Data de pagamento (date picker)

4. Validações:
   - Todos os campos obrigatórios
   - Data não pode ser no passado
   - Horários válidos
   - Valores numéricos positivos

5. Ao submeter:
   - Gerar numero_ocorrencia automático (service)
   - Insert em ocorrencias
   - Insert em ocorrencias_participantes (vagas em aberto)
   - Status: EM_ABERTO
   - Toast de sucesso
   - Redirecionar para lista de ocorrências

DELIVERABLES:
- [ ] Formulário de criação
- [ ] Validações completas
- [ ] Criação automática de vagas
- [ ] Geração de número de ocorrência

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

---

## **FASE 8: PÁGINA DE OCORRÊNCIAS (CHEFE DOS MÉDICOS)**

### 📝 Prompt 8.1 - Banco de Dados de Ocorrências

```
TAREFA: Criar Página de Banco de Dados de Ocorrências

CONTEXTO:
- Tabela com todas as ocorrências
- Filtros avançados
- Ocorrências ativas no topo

REQUISITOS:

1. Criar página: src/app/(dashboard)/chefe-medicos/ocorrencias/page.tsx

2. Criar componente: src/components/ocorrencias/OcorrenciasTable.tsx
   - Ordenação: ativas primeiro, depois por data
   - Paginação
   - Busca e filtros

3. Colunas da tabela:
   - Número da ocorrência
   - Status (badge colorido)
   - Tipo de trabalho
   - Tipo de ambulância
   - Data e horário
   - Local
   - Ambulância (placa) - se atribuída
   - Ação: botão "Ver Detalhes"

4. Filtros:
   - Por data (date range picker)
   - Por ID (input)
   - Por tipo de ocorrência (select)
   - Por tipo de ambulância (select)
   - Por status (select)

5. Destaque visual:
   - Ocorrências ativas (EM_ANDAMENTO): fundo verde claro
   - Ocorrências confirmadas: fundo azul claro
   - Concluídas: opacidade reduzida

DELIVERABLES:
- [ ] Tabela de ocorrências
- [ ] Filtros funcionais
- [ ] Ordenação correta
- [ ] Destaque visual

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

### 📝 Prompt 8.2 - Detalhes de Ocorrências Ativas e Concluídas

```
TAREFA: Expandir Modal de Detalhes para Ocorrências Ativas e Concluídas

CONTEXTO:
- Reut ilizar OcorrenciaDetalhesModal
- Adaptar conteúdo por status
- Adicionar funcionalidade de avisos

REQUISITOS:

1. Atualizar OcorrenciaDetalhesModal:

   Para status "CONFIRMADA":
   - Mostrar todos os profissionais confirmados
   - Data, horário, local
   - Tipo de ocorrência e ambulância
   - Carga horária (se evento)
   - Placa (se já atribuída)

   Para status "EM_ANDAMENTO":
   - Todas as informações de "CONFIRMADA"
   - Localização em tempo real (mapa)
   - Botão "Enviar Aviso" (apenas para Chefe dos Médicos)
   - Lista de pacientes atendidos

   Para status "CONCLUIDA":
   - Local da ocorrência
   - Duração total
   - Informações dos pacientes: nome, idade, quadro clínico
   - Placa da ambulância
   - Tipo de ocorrência
   - Profissionais participantes
   - Consumo de materiais

2. Funcionalidade "Enviar Aviso":
   - Modal com textarea
   - Enviar notificação para todos os participantes
   - Insert em notificacoes
   - Toast de confirmação

DELIVERABLES:
- [ ] Modal adaptado por status
- [ ] Funcionalidade de avisos
- [ ] Exibição completa de dados

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

---

## **FASE 9: RASTREAMENTO DE AMBULÂNCIAS**

### 📝 Prompt 9.1 - Página de Rastreamento com Mapa

```
TAREFA: Criar Página de Rastreamento de Ambulâncias em Tempo Real

CONTEXTO:
- Mapa interativo
- Localização de ambulâncias ativas
- Integração com Google Maps ou Mapbox

REQUISITOS:

1. Instalar biblioteca de mapas:
   - Google Maps React ou Mapbox GL JS
   - Escolher opção mais econômica

2. Criar página: src/app/(dashboard)/chefe-medicos/rastreamento/page.tsx

3. Componente de mapa:
   - Exibir mapa centralizado
   - Markers para cada ambulância ativa
   - Cores diferentes por status
   - Atualização em tempo real (Supabase Realtime)

4. Ao clicar em marker:
   - Abrir info window com:
     * Placa
     * Tipo
     * Ocorrência atual
   - Botão "Ver Detalhes" → abre OcorrenciaDetalhesModal

5. Painel lateral:
   - Lista de ambulâncias ativas
   - Ao clicar: centralizar mapa no marker

6. Implementar Supabase Realtime:
   - Subscribe em rastreamento_ambulancias
   - Atualizar markers automaticamente

DELIVERABLES:
- [ ] Página de rastreamento
- [ ] Mapa interativo
- [ ] Markers de ambulâncias
- [ ] Atualização em tempo real

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
- Documentar API key do mapa
```

---

## **FASE 10: GESTÃO DE AMBULÂNCIAS (CHEFE DOS MÉDICOS)**

### 📝 Prompt 10.1 - Banco de Dados de Ambulâncias

```
TAREFA: Criar Página de Gestão de Ambulâncias

CONTEXTO:
- CRUD de ambulâncias
- Visualização de detalhes e estatísticas
- Histórico de ocorrências

REQUISITOS:

1. Criar página: src/app/(dashboard)/chefe-medicos/ambulancias/page.tsx

2. Botão "Cadastrar Nova Ambulância":
   - Abre modal com formulário

3. Componente: CadastrarAmbulanciaModal
   - Campos: marca, modelo, ano, motor, placa
   - Kilometragem inicial
   - Próxima revisão (km)
   - Validações (placa, ano, km)
   - Usar ambulanciasService.create()

4. Lista de ambulâncias:
   - Grid de cards ou tabela
   - Mostrar: placa, modelo, status, tipo atual
   - Filtro por status

5. Ao clicar em ambulância:
   - Expandir/abrir modal com detalhes

DELIVERABLES:
- [ ] Página de ambulâncias
- [ ] Formulário de cadastro
- [ ] Lista de ambulâncias

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

### 📝 Prompt 10.2 - Detalhes e Estatísticas de Ambulância

```
TAREFA: Criar Modal de Detalhes da Ambulância

CONTEXTO:
- Informações técnicas
- Últimas ocorrências
- Estatísticas de uso
- Gastos

REQUISITOS:

1. Componente: AmbulanciaDetalhesModal
   - Props: ambulanciaId

2. Seção: Informações Técnicas
   - Marca, modelo, ano, motor
   - Placa, kilometragem atual
   - Última revisão, próxima revisão
   - Status atual

3. Seção: Últimas Ocorrências
   - Lista das 10 últimas
   - Card clicável → abre OcorrenciaDetalhesModal
   - Ordenar por data (mais recente)

4. Seção: Estatísticas
   - Usar query: queries.getHistoricoAmbulancia()
   - Gastos totais
   - Número de ocorrências (diário/semanal/mensal/anual)
   - Gráfico de pizza: % por tipo de atendimento
   - Usar Recharts para gráficos

5. Seção: Gastos
   - Lista de gastos recentes
   - Total por período

DELIVERABLES:
- [ ] Modal de detalhes
- [ ] Estatísticas funcionais
- [ ] Gráficos
- [ ] Histórico de ocorrências

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

---

## **FASE 11: GESTÃO DE PROFISSIONAIS E ESCALA**

### 📝 Prompt 11.1 - Banco de Dados de Profissionais

```
TAREFA: Criar Página de Gestão de Profissionais

CONTEXTO:
- Lista de todos os usuários
- Filtro por perfil
- Visualização de dados

REQUISITOS:

1. Criar página: src/app/(dashboard)/chefe-medicos/profissionais/page.tsx

2. Tabela de profissionais:
   - Colunas: nome, função, CPF, email, telefone, idade, sexo
   - Filtro por tipo de perfil
   - Busca por nome
   - Paginação

3. Usar usuariosService.getAll()

4. Indicador visual:
   - Ativo: verde
   - Inativo: cinza

5. Ações:
   - Ver detalhes (modal)
   - Editar (modal)
   - Desativar/Reativar

DELIVERABLES:
- [ ] Tabela de profissionais
- [ ] Filtros e busca
- [ ] Ações básicas

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

### 📝 Prompt 11.2 - Sistema de Escala

```
TAREFA: Criar Sistema de Gestão de Escala

CONTEXTO:
- Calendário de disponibilidade
- Marcação de folgas
- Atualiza filtro de ocorrências disponíveis

REQUISITOS:

1. Criar página: src/app/(dashboard)/chefe-medicos/escala/page.tsx

2. Componente: CalendarioEscala
   - Calendário mensal
   - Seleção de profissional (dropdown)
   - Marcar dias de folga/trabalho
   - Cores: verde (disponível), vermelho (folga)

3. Funcionalidades:
   - Clicar em dia: toggle disponibilidade
   - Salvar automaticamente (debounced)
   - Usar escalaService.upsert()

4. Visualização:
   - Legenda de cores
   - Resumo de folgas do mês
   - Filtro por tipo de perfil

DELIVERABLES:
- [ ] Calendário de escala
- [ ] Marcação de folgas
- [ ] Salvamento automático

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

---

## **FASE 12: PERFIL DO MOTORISTA (TABLET)**

### 📝 Prompt 12.1 - Interface do Tablet para Motorista

```
TAREFA: Criar Interface de Tablet para Motorista

CONTEXTO:
- Tablet fixo na ambulância
- Ocorrência aparece automaticamente quando atribuída
- Botão "Iniciar Ocorrência" muda status para EM_ANDAMENTO

REQUISITOS:

1. Criar página: src/app/(dashboard)/motorista/page.tsx
   - Layout simplificado (sem sidebar)
   - Fullscreen
   - Touch-friendly (botões grandes)

2. Estados da interface:

   Estado 1: Aguardando Atribuição
   - Mensagem: "Nenhuma ocorrência atribuída"
   - Card com última ocorrência concluída

   Estado 2: Ocorrência Atribuída (CONFIRMADA)
   - Detalhes da ocorrência
   - Tipo, local, horário
   - Lista de integrantes (médico/enfermeiro)
   - Botão grande: "Iniciar Ocorrência"

   Estado 3: Ocorrência Em Andamento
   - GPS com rota em tempo real
   - Integração com Waze/Google Maps/Mapbox
   - Botão "Próximo Destino" (se múltiplas paradas)
   - Lista de integrantes com WhatsApp
   - Botão "Concluir Ocorrência"

3. Lógica de rotas:
   - Se precisar buscar médico: 1º destino = residência do médico
   - Após buscar: 2º destino = local da ocorrência
   - Ao finalizar: rota de retorno à base

4. Ação "Iniciar Ocorrência":
   - Atualizar status para EM_ANDAMENTO
   - data_inicio = NOW()
   - Notificar todos os participantes

5. Ação "Concluir Ocorrência":
   - Atualizar status para CONCLUIDA
   - data_conclusao = NOW()
   - Ambulância volta a PENDENTE

DELIVERABLES:
- [ ] Interface de tablet
- [ ] 3 estados funcionais
- [ ] Integração com GPS
- [ ] Botões de controle

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
- Documentar integração GPS
```

---

## **FASE 13: CHEFE DAS AMBULÂNCIAS - DASHBOARD E STATUS**

### 📝 Prompt 13.1 - Dashboard do Chefe das Ambulâncias

```
TAREFA: Criar Dashboard do Chefe das Ambulâncias

CONTEXTO:
- Foco em veículos
- Estatísticas de frota
- Avisos de manutenção

REQUISITOS:

1. Criar página: src/app/(dashboard)/chefe-ambulancias/page.tsx

2. Cards de estatísticas:
   - Ambulâncias disponíveis (status = PRONTA)
   - Ambulâncias em manutenção (status = REVISAO)
   - Gastos da frota (mensal/semanal/diário)

3. Grid de ambulâncias:
   - Card clicável para cada ambulância
   - Mostrar: placa, modelo, status, tanque, km

4. Seção de avisos:
   - Ambulâncias próximas de revisão
   - Alertas de manutenção

DELIVERABLES:
- [ ] Dashboard funcional
- [ ] Cards de ambulâncias
- [ ] Estatísticas

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

### 📝 Prompt 13.2 - Página de Status das Ambulâncias

```
TAREFA: Criar Página de Status e Checklist Técnico

CONTEXTO:
- Controle de manutenção
- Checklist técnico diário
- Mudança de status

REQUISITOS:

1. Criar página: src/app/(dashboard)/chefe-ambulancias/status/page.tsx

2. Lista de ambulâncias:
   - Todas as ambulâncias
   - Agrupadas por status (Pronta, Pendente, Revisão, Em Operação)
   - Drag and drop? (opcional)

3. Card de ambulância:
   - Placa, modelo
   - Status (badge)
   - Botão "Verificar" (se PENDENTE)
   - Botão "Ver Detalhes" (se EM_OPERACAO)

4. Modal de Checklist Técnico:
   - Abrir ao clicar em "Verificar"
   - Checkboxes:
     * Gasolina OK
     * Temperatura OK
     * Pressão dos pneus OK
     * Revisão em dia OK
   - Input: kilometragem atual
   - Textarea: observações
   - Botão "Aprovar Checklist"

5. Ao aprovar checklist técnico:
   - Insert em checklist_tecnico_ambulancias
   - Status da ambulância não muda ainda
   - Aguarda checklist médico (Chefe dos Enfermeiros)

DELIVERABLES:
- [ ] Página de status
- [ ] Checklist técnico funcional
- [ ] Agrupamento por status

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

---

## **FASE 14: ATRIBUIÇÃO DE OCORRÊNCIAS**

### 📝 Prompt 14.1 - Página de Atribuição de Recursos

```
TAREFA: Criar Página de Atribuição de Ambulâncias e Motoristas

CONTEXTO:
- Exclusivo do Chefe das Ambulâncias
- Ocorrências confirmadas aguardando atribuição
- Atribui ambulância + motorista

REQUISITOS:

1. Criar página: src/app/(dashboard)/chefe-ambulancias/atribuicao/page.tsx

2. Lista de ocorrências confirmadas:
   - Filtrar: status = CONFIRMADA
   - Ordenar por data/horário
   - Card por ocorrência

3. Card de ocorrência:
   - Número, tipo, data, horário
   - Tipo de ambulância necessário
   - Local
   - Profissionais confirmados
   - Botão "Atribuir Recursos"

4. Modal de Atribuição:
   - Detalhes da ocorrência
   - Select: ambulâncias disponíveis
     * Filtrar: status = PRONTA
     * Filtrar: tipo_atual = tipo da ocorrência
   - Select: motoristas disponíveis
   - Botão "Confirmar Atribuição"

5. Ao confirmar atribuição:
   - Atualizar ocorrencia: ambulancia_id, motorista_id, data_atribuicao
   - Status permanece CONFIRMADA (não muda!)
   - Ambulância muda para EM_OPERACAO
   - Tablet da ambulância abre ocorrência automaticamente
   - Notificar motorista

DELIVERABLES:
- [ ] Página de atribuição
- [ ] Modal de atribuição
- [ ] Filtros corretos
- [ ] Lógica de atribuição

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

---

## **FASE 15: CHEFE DOS ENFERMEIROS - EQUIPAMENTOS MÉDICOS**

### 📝 Prompt 15.1 - Dashboard do Chefe dos Enfermeiros

```
TAREFA: Criar Dashboard do Chefe dos Enfermeiros

CONTEXTO:
- Foco em equipamentos médicos
- Estatísticas de estoque
- Alertas de reposição

REQUISITOS:

1. Criar página: src/app/(dashboard)/chefe-enfermeiros/page.tsx

2. Cards de estatísticas:
   - Ambulâncias prontas (checklist médico aprovado)
   - Ambulâncias pendentes de verificação
   - Alertas de reposição (vw_estoque_baixo)

3. Lista de alertas:
   - Itens com estoque baixo
   - Ambulância, item, quantidade a repor
   - Ordenar por urgência (quantidade mais baixa)

DELIVERABLES:
- [ ] Dashboard funcional
- [ ] Alertas de estoque

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

### 📝 Prompt 15.2 - Status de Equipamentos Médicos e Checklist

```
TAREFA: Criar Página de Gestão de Equipamentos Médicos

CONTEXTO:
- Verificação matinal de todas as ambulâncias
- Define tipo (BASICA | EMERGENCIA)
- Checklist específico por tipo
- Reposição de materiais

REQUISITOS:

1. Criar página: src/app/(dashboard)/chefe-enfermeiros/equipamentos/page.tsx

2. Lista de ambulâncias:
   - Mostrar todas
   - Status: "Verificado" (verde) | "Pendente" (vermelho)
   - Botão "Verificar Equipamentos"

3. Modal de Checklist de Equipamentos:

   Passo 1: Selecionar Tipo
   - Radio button: BASICA | EMERGENCIA
   - Explicação de cada tipo
   - Botão "Próximo"

   Passo 2: Checklist de Equipamentos
   - Carregar lista baseada no tipo selecionado
   - Para cada equipamento:
     * Nome
     * Quantidade atual (do estoque)
     * Quantidade mínima
     * Input: quantidade reposta
     * Checkbox: conforme
     * Observações (opcional)
   - Agrupar por categoria

4. Categorias de equipamentos (conforme contexto.txt):
   - KIT VIAS AÉREAS / AMBU/BOLSA
   - KIT EPI'S INDIVIDUAL
   - KIT PROCEDIMENTO E PUNÇÃO
   - MATERIAIS ELÉTRICOS
   - MATERIAL AMB (Geral)
   - KIT SUTURA BOLSA
   - KIT SONDAGEM BOLSA

5. Ao aprovar checklist:
   - Insert em checklist_equipamentos_ambulancias
   - Insert em checklist_equipamentos_itens (cada item)
   - Atualizar estoque_ambulancias (quantidade_atual += quantidade_reposta)
   - Atualizar ambulancia: tipo_atual = tipo_definido
   - Se AMBOS checklists aprovados (técnico + médico):
     * Mudar status da ambulância para PRONTA

DELIVERABLES:
- [ ] Página de equipamentos
- [ ] Modal de checklist
- [ ] Seleção de tipo
- [ ] Reposição de estoque
- [ ] Lógica de aprovação

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

---

## **FASE 16: REGISTRO DE CONSUMO DE MATERIAIS (MÉDICO)**

### 📝 Prompt 16.1 - Registro de Consumo ao Final da Ocorrência

```
TAREFA: Implementar Registro de Consumo de Materiais

CONTEXTO:
- Médico registra ao FINAL da ocorrência
- Antes de concluir (obrigatório)
- Atualiza estoque automaticamente

REQUISITOS:

1. Adicionar ao fluxo de conclusão de ocorrência:
   - Ao clicar "Concluir Ocorrência" (médico)
   - Abrir modal obrigatório de consumo

2. Criar componente: RegistrarConsumoModal
   - Props: ocorrenciaId, ambulanciaId
   - Lista de TODOS os equipamentos da ambulância
   - Agrupar por categoria

3. Para cada equipamento:
   - Nome
   - Quantidade atual no estoque
   - Input numérico: quantidade utilizada
   - Default: 0

4. Validações:
   - Quantidade utilizada <= quantidade atual
   - Não permitir valores negativos

5. Ao salvar:
   - Insert em consumo_materiais (cada item utilizado)
   - Trigger automático atualiza estoque_ambulancias
   - Permitir concluir ocorrência
   - Toast de sucesso

6. Não permitir concluir sem registrar:
   - Desabilitar botão "Concluir"
   - Mostrar aviso

DELIVERABLES:
- [ ] Modal de registro de consumo
- [ ] Validações funcionais
- [ ] Atualização de estoque
- [ ] Integração com conclusão

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

---

## **FASE 17: SISTEMA DE NOTIFICAÇÕES**

### 📝 Prompt 17.1 - Sistema de Notificações em Tempo Real

```
TAREFA: Implementar Sistema de Notificações

CONTEXTO:
- Notificações para todos os perfis
- Supabase Realtime
- Badge de contagem no header

REQUISITOS:

1. Criar hook: useNotificacoes
   - Subscribe em notificacoes WHERE destinatario_id = usuario
   - Realtime updates
   - Contar não lidas

2. Atualizar Header:
   - Badge com contagem de não lidas
   - Ao clicar: abrir dropdown de notificações

3. Componente: NotificacoesDropdown
   - Lista das últimas 10
   - Marcar como lida ao visualizar
   - Link "Ver todas"

4. Criar página: /notificacoes
   - Todas as notificações
   - Filtro: lidas/não lidas
   - Marcar todas como lidas

5. Tipos de notificações:
   - Nova ocorrência disponível
   - Ocorrência confirmada
   - Ambulância atribuída
   - Ocorrência iniciada
   - Aviso do chefe
   - Manutenção necessária
   - Estoque baixo

DELIVERABLES:
- [ ] Hook de notificações
- [ ] Badge no header
- [ ] Dropdown funcional
- [ ] Página de notificações

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

---

## **FASE 18: ATENDIMENTO DE PACIENTES (MÉDICO)**

### 📝 Prompt 18.1 - Cadastro de Pacientes Durante Ocorrência

```
TAREFA: Implementar Cadastro de Pacientes e Atendimentos

CONTEXTO:
- Durante ocorrência EM_ANDAMENTO
- Médico cadastra pacientes atendidos
- Formulário de prontuário

REQUISITOS:

1. Adicionar ao OcorrenciaDetalhesModal (status EM_ANDAMENTO):
   - Se perfil = MEDICO
   - Botão "Cadastrar Paciente"

2. Modal de Cadastro de Paciente:
   - Dados pessoais: nome, CPF, data nascimento, sexo, telefone
   - Endereço
   - Contato de emergência
   - Verificar se CPF já existe (reutilizar cadastro)

3. Formulário de Atendimento:
   - Queixa principal (textarea)
   - Quadro clínico (textarea)
   - Procedimentos realizados (textarea)
   - Diagnóstico (textarea)
   - Checkbox: Remoção
   - Se remoção: Hospital destino (text)
   - Observações (textarea)

4. Upload de arquivos:
   - Supabase Storage
   - Imagens e documentos
   - Preview de imagens

5. Ao salvar:
   - Insert/update em pacientes
   - Insert em atendimentos
   - Insert em atendimentos_arquivos (se houver)
   - Vincular a ocorrencia_id
   - Toast de sucesso

DELIVERABLES:
- [ ] Modal de cadastro de paciente
- [ ] Formulário de atendimento
- [ ] Upload de arquivos
- [ ] Integração com Storage

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

---

## **FASE 19: RELATÓRIOS E GRÁFICOS**

### 📝 Prompt 19.1 - Página de Relatórios (Chefe dos Médicos)

```
TAREFA: Criar Página de Relatórios e Estatísticas

CONTEXTO:
- Usar views criadas no banco
- Gráficos com Recharts
- Filtros por período

REQUISITOS:

1. Criar página: src/app/(dashboard)/chefe-medicos/relatorios/page.tsx

2. Filtros de período:
   - Seleção de mês/ano
   - Range de datas

3. Gráficos:

   Gráfico 1: Ocorrências por Tipo
   - Barra/Pizza
   - Dados: vw_resumo_ocorrencias
   - Agrupar por tipo_trabalho

   Gráfico 2: Ocorrências por Status
   - Pizza
   - Distribuição de status

   Gráfico 3: Ambulâncias Mais Utilizadas
   - Barra horizontal
   - Dados: vw_estatisticas_ambulancias
   - Ordenar por total_ocorrencias

   Gráfico 4: Gastos da Frota
   - Linha temporal
   - Gastos por mês

4. Cards de resumo:
   - Total de ocorrências
   - Total de pacientes atendidos
   - Taxa de remoção (%)
   - Tempo médio de atendimento

5. Botão "Exportar Relatório":
   - Gerar PDF com gráficos
   - Ou exportar CSV

DELIVERABLES:
- [ ] Página de relatórios
- [ ] 4 gráficos funcionais
- [ ] Filtros por período
- [ ] Cards de resumo

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

---

## **FASE 20: OTIMIZAÇÕES E PWA**

### 📝 Prompt 20.1 - Configurar PWA (Progressive Web App)

```
TAREFA: Configurar PWA para uso em tablets e celulares

CONTEXTO:
- Sistema deve funcionar como app nativo
- Instalável no tablet do motorista
- Offline support básico

REQUISITOS:

1. Instalar next-pwa:
   ```bash
   npm install next-pwa
   ```

2. Configurar next.config.ts:
   - Habilitar PWA
   - Service worker
   - Manifest

3. Criar manifest.json:
   - Nome do app
   - Ícones (vários tamanhos)
   - Theme color
   - Display: standalone

4. Criar ícones:
   - 192x192, 512x512
   - Splash screens

5. Testar instalação:
   - Chrome (adicionar à tela inicial)
   - Safari iOS
   - Android

DELIVERABLES:
- [ ] PWA configurado
- [ ] Manifest funcional
- [ ] Ícones criados
- [ ] Instalável

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
- Guia de instalação
```

### 📝 Prompt 20.2 - Otimizações de Performance

```
TAREFA: Otimizar Performance da Aplicação

REQUISITOS:

1. Code splitting:
   - Dynamic imports
   - Lazy loading de modals
   - Route-based splitting

2. Otimização de imagens:
   - Next.js Image component
   - Lazy loading

3. Caching:
   - React Query para cache de server state
   - Stale-while-revalidate

4. Lighthouse audit:
   - Performance > 90
   - Accessibility > 90
   - Best Practices > 90
   - SEO > 90

5. Bundle analysis:
   - Identificar pacotes pesados
   - Tree shaking

DELIVERABLES:
- [ ] Code splitting implementado
- [ ] Lighthouse score > 90
- [ ] Tempo de carregamento < 3s

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

---

## **FASE 21: TESTES E DEPLOY**

### 📝 Prompt 21.1 - Testes End-to-End

```
TAREFA: Implementar Testes E2E com Playwright

CONTEXTO:
- Testar fluxos críticos
- Garantir funcionamento

REQUISITOS:

1. Instalar Playwright:
   ```bash
   npm install -D @playwright/test
   ```

2. Testes críticos:
   - Login
   - Criar ocorrência
   - Confirmar participação
   - Atribuir ambulância
   - Iniciar ocorrência
   - Cadastrar paciente
   - Concluir ocorrência

3. Executar antes de deploy

DELIVERABLES:
- [ ] Testes E2E funcionais
- [ ] CI/CD integrado

DOCUMENTAÇÃO:
- Atualizar CHANGELOG.md
```

### 📝 Prompt 21.2 - Deploy em Produção

```
TAREFA: Deploy da Aplicação

REQUISITOS:

1. Preparar para produção:
   - Configurar variáveis de ambiente (Vercel)
   - Habilitar RLS no Supabase
   - Criar políticas de acesso

2. Deploy no Vercel:
   - Conectar repositório GitHub
   - Configurar domínio
   - Environment variables

3. Monitoramento:
   - Sentry para erros
   - Analytics

DELIVERABLES:
- [ ] App em produção
- [ ] RLS habilitado
- [ ] Monitoramento ativo

DOCUMENTAÇÃO:
- Atualizar README.md
- Guia de deploy
```

---

## 📊 TRACKING DE PROGRESSO

### Fases Concluídas
- [x] FASE 0: Infraestrutura e Database

### Fases em Andamento
- [ ] FASE 1: Autenticação

### Fases Pendentes
- [ ] FASE 2-21 conforme cronograma acima

---

## 📝 COMO USAR ESTE PLANO

### Para cada fase:

1. **Leia o prompt completo**
2. **Copie e cole no Claude/Cursor**
3. **Aguarde implementação**
4. **Teste manualmente**
5. **Atualize CHANGELOG.md**
6. **Faça commit**
7. **Próxima fase**

### Regras de Ouro:

✅ **Sempre** testar antes de prosseguir
✅ **Sempre** atualizar documentação
✅ **Sempre** fazer commits frequentes
✅ **Sempre** seguir a ordem das fases
✅ **Sempre** reutilizar componentes

---

## 🎯 PRIORIDADES

### Alta Prioridade (MVP):
1. Autenticação (FASE 1)
2. Dashboard Médico (FASE 3)
3. Dashboard Enfermeiro (FASE 6)
4. Chefe dos Médicos - Criar Ocorrências (FASE 7)
5. Motorista - Tablet (FASE 12)
6. Atribuição de Recursos (FASE 14)

### Média Prioridade:
- Rastreamento (FASE 9)
- Pacientes (FASE 5)
- Gestão de Ambulâncias (FASE 10)

### Baixa Prioridade:
- Relatórios (FASE 19)
- PWA (FASE 20)

---

## 📞 SUPORTE

- **Documentação Técnica**: Ver arquivos .md na raiz
- **Contexto Funcional**: `Init/contexto.txt`
- **Instruções de Dev**: `claude.md`
- **Database**: `SETUP_DATABASE.md`

---

**INÍCIO DA EXECUÇÃO: FASE 1 - Autenticação**

Use o **Prompt 1.1** para começar! 🚀
