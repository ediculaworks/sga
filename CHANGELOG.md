# Changelog

Todas as mudan�as not�veis neste projeto ser�o documentadas neste arquivo.

O formato � baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

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
