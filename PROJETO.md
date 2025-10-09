# Sistema de Gestão de Ambulâncias (SGA)

## Visão Geral
Sistema completo de gestão de ambulâncias para eventos, emergências, domiciliares e transferências.

**Plataformas:** Web + Mobile (PWA)
**Database:** PostgreSQL (Supabase)
**Stack:** Next.js 14 + React + TypeScript + Tailwind + shadcn/ui

---

## Perfis de Usuário

1. **MEDICO** - Atende pacientes, registra prontuários
2. **ENFERMEIRO** - Auxilia atendimentos, adiciona notas
3. **MOTORISTA** - Tablet na ambulância, opera GPS
4. **CHEFE_MEDICOS** - Cria ocorrências, gerencia equipe
5. **CHEFE_ENFERMEIROS** - Verifica equipamentos médicos
6. **CHEFE_AMBULANCIAS** - Atribui recursos, verifica veículos

---

## Regras de Negócio Essenciais

### Estados das Ocorrências
- **EM_ABERTO** → Aguardando profissionais confirmarem
- **CONFIRMADA** → Profissionais OK, aguardando ambulância
- **EM_ANDAMENTO** → Motorista iniciou operação
- **CONCLUIDA** → Finalizada

### Tipos de Ambulância
- **BASICA** → 1 Enfermeiro (sem médico)
- **EMERGENCIA** → 1 Médico + 1 Enfermeiro

### Status das Ambulâncias
- **PRONTA** → Liberada (checklists OK)
- **PENDENTE** → Aguardando verificação
- **REVISAO** → Precisa manutenção

### Fluxo Principal
1. Chefe Médicos cria ocorrência → **EM_ABERTO**
2. Profissionais confirmam → **CONFIRMADA** (automático)
3. Chefe Ambulâncias atribui veículo + motorista
4. Motorista inicia no tablet → **EM_ANDAMENTO**
5. Motorista finaliza → **CONCLUIDA**

---

## Database (23 tabelas)

**Usuários:** usuarios, motoristas, escala
**Ambulâncias:** ambulancias, equipamentos_catalogo, estoque_ambulancias, gastos_ambulancias
**Checklists:** checklist_tecnico, checklist_equipamentos, checklist_equipamentos_itens
**Ocorrências:** ocorrencias, ocorrencias_participantes
**Atendimentos:** pacientes, atendimentos, atendimentos_arquivos, notas_enfermeiro, consumo_materiais
**Sistema:** notificacoes, rastreamento_ambulancias, logs_sistema

**ENUMs:** tipo_perfil, status_ocorrencia, tipo_ambulancia, tipo_trabalho, status_ambulancia, categoria_equipamento, sexo

---

## Tech Stack

### Core
- Next.js 14+ (App Router), React 18, TypeScript
- Tailwind CSS, shadcn/ui, Lucide Icons
- Supabase (PostgreSQL, Auth, Storage, Realtime)

### State & Data
- Zustand (state global), React Query (cache)
- React Hook Form + Zod (validação)

### Features
- date-fns (datas), Recharts (gráficos)
- Mapbox/Google Maps (GPS)
- React Hot Toast (notificações)

---

## Estrutura de Pastas

```
/src
  /app
    /(auth)/login
    /(dashboard)/[perfil]
    /api
  /components
    /ui              # shadcn
    /shared          # reutilizáveis
    /layout          # Layout, Sidebar, Header
    /dashboard/[perfil]
  /lib
    /supabase
    /utils
  /types
  /hooks
  /stores            # Zustand
```

---

## Decisões Arquiteturais

- **Next.js** → SSR, otimização, deploy Vercel
- **Supabase** → PostgreSQL completo, RLS nativo
- **PWA** → Uma codebase para todas as plataformas
- **Zustand** → State simples, menos boilerplate
- **shadcn/ui** → Componentes copiáveis, customizáveis

---

## Referências

- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com
- React Query: https://tanstack.com/query
- Zod: https://zod.dev
