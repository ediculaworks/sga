# 📂 Estrutura do Projeto SGA

Este documento descreve a estrutura completa de pastas e arquivos do Sistema de Gestão de Ambulâncias.

## 📁 Estrutura de Diretórios

```
sga/
├── .next/                        # Build do Next.js (gerado automaticamente)
├── node_modules/                 # Dependências (gerado automaticamente)
├── public/                       # Arquivos estáticos públicos
├── src/                          # Código-fonte principal
│   ├── app/                      # App Router do Next.js 14
│   │   ├── (auth)/              # Grupo de rotas de autenticação
│   │   │   └── layout.tsx       # Layout para páginas de auth
│   │   ├── (dashboard)/         # Grupo de rotas do dashboard
│   │   │   └── layout.tsx       # Layout com Header
│   │   ├── api/                 # API Routes
│   │   │   └── health/          # Endpoint de health check
│   │   │       └── route.ts     # GET /api/health
│   │   ├── globals.css          # Estilos globais + Tailwind
│   │   ├── layout.tsx           # Layout raiz
│   │   └── page.tsx             # Página inicial (/)
│   ├── components/              # Componentes React
│   │   ├── ui/                  # Componentes shadcn/ui
│   │   │   ├── button.tsx       # Botão com variantes
│   │   │   ├── card.tsx         # Card e subcomponentes
│   │   │   ├── input.tsx        # Input de texto
│   │   │   ├── label.tsx        # Label para forms
│   │   │   ├── select.tsx       # Select dropdown
│   │   │   └── toast.tsx        # Sistema de toast (Sonner)
│   │   └── shared/              # Componentes compartilhados
│   │       └── Header.tsx       # Cabeçalho da aplicação
│   ├── hooks/                   # React Hooks customizados
│   │   └── useSupabase.ts       # Hook para Supabase
│   ├── lib/                     # Bibliotecas e utilitários
│   │   ├── supabase/            # Configuração Supabase
│   │   │   ├── client.ts        # Cliente para browser
│   │   │   └── server.ts        # Cliente para server
│   │   └── utils.ts             # Função cn() e outros utils
│   ├── stores/                  # Zustand stores
│   │   └── authStore.ts         # Store de autenticação
│   └── types/                   # TypeScript types
│       └── index.ts             # Tipos globais
├── .env.example                 # Template de variáveis de ambiente
├── .env.local                   # Variáveis de ambiente (ignorado)
├── .eslintrc.json              # Configuração ESLint
├── .gitignore                  # Arquivos ignorados pelo Git
├── .prettierrc                 # Configuração Prettier
├── .prettierignore             # Arquivos ignorados pelo Prettier
├── CHANGELOG.md                # Histórico de mudanças
├── components.json             # Configuração shadcn/ui
├── next.config.ts              # Configuração Next.js
├── package.json                # Dependências e scripts
├── postcss.config.mjs          # Configuração PostCSS
├── PROJECT_STRUCTURE.md        # Este arquivo
├── README.md                   # Documentação principal
├── tailwind.config.ts          # Configuração Tailwind CSS
└── tsconfig.json               # Configuração TypeScript
```

## 🎯 Convenções de Organização

### App Router (Next.js 14)

- **Route Groups** `(nome)`: Grupos de rotas sem afetar a URL
  - `(auth)`: Login, registro, recuperação de senha
  - `(dashboard)`: Rotas autenticadas do sistema

- **API Routes**: Dentro de `app/api/`
  - Cada pasta é um endpoint
  - `route.ts` define GET, POST, PUT, DELETE, etc.

### Componentes

- **`ui/`**: Componentes base do shadcn/ui
  - Estilizados e prontos para uso
  - Podem ser customizados conforme necessário

- **`shared/`**: Componentes reutilizáveis específicos do projeto
  - Header, Footer, Sidebar, etc.
  - Componentes de negócio

### Bibliotecas e Utilitários

- **`lib/supabase/`**: Configuração de clientes Supabase
  - `client.ts`: Para Client Components (navegador)
  - `server.ts`: Para Server Components e API Routes

- **`lib/utils.ts`**: Funções utilitárias
  - `cn()`: Combinar classes CSS do Tailwind

### Hooks Customizados

- **`hooks/`**: React Hooks específicos do projeto
  - Encapsulam lógica reutilizável
  - Facilitam acesso a APIs e serviços

### Gerenciamento de Estado

- **`stores/`**: Zustand stores
  - Estado global da aplicação
  - Alternativa leve ao Redux

### TypeScript Types

- **`types/`**: Definições de tipos
  - Interfaces de banco de dados
  - Tipos de entidades (User, Ambulancia, etc.)
  - Tipos utilitários

## 🔧 Arquivos de Configuração

### Essenciais

- **`next.config.ts`**: Configuração do Next.js
- **`tsconfig.json`**: Configuração TypeScript
- **`tailwind.config.ts`**: Configuração Tailwind CSS
- **`components.json`**: Configuração shadcn/ui

### Code Quality

- **`.eslintrc.json`**: Regras de linting
- **`.prettierrc`**: Formatação de código

### Ambiente

- **`.env.local`**: Variáveis de ambiente (local, não commitado)
- **`.env.example`**: Template de variáveis

## 📦 Próximas Pastas a Serem Criadas

Conforme o desenvolvimento avança, adicionar:

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── ambulancias/         # CRUD de ambulâncias
│   │   ├── motoristas/          # CRUD de motoristas
│   │   ├── ocorrencias/         # Gestão de ocorrências
│   │   └── dashboard/           # Página principal
│   └── (auth)/
│       ├── login/               # Página de login
│       └── registro/            # Página de registro
├── services/                    # Camada de serviços
│   ├── ambulancia.service.ts
│   ├── motorista.service.ts
│   └── ocorrencia.service.ts
├── validators/                  # Schemas de validação (Zod)
│   ├── ambulancia.schema.ts
│   └── motorista.schema.ts
└── middleware/                  # Middlewares Next.js
    └── auth.middleware.ts
```

## 🎨 Padrões de Nomenclatura

### Arquivos e Pastas

- **Componentes**: PascalCase (`Button.tsx`, `UserCard.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useAuth.ts`, `useSupabase.ts`)
- **Utilitários**: camelCase (`utils.ts`, `formatters.ts`)
- **Tipos**: PascalCase em `index.ts` (`User`, `Ambulancia`)
- **API Routes**: kebab-case para pastas, `route.ts` para arquivo

### Código

- **Componentes**: PascalCase
- **Funções**: camelCase
- **Constantes**: UPPER_SNAKE_CASE
- **Interfaces/Types**: PascalCase com `I` opcional

## 📝 Boas Práticas

1. **Colocação (Colocation)**: Manter arquivos relacionados próximos
2. **Separação de Responsabilidades**: Componentes, lógica, e dados separados
3. **DRY (Don't Repeat Yourself)**: Reutilizar componentes e hooks
4. **Type Safety**: Sempre definir tipos TypeScript
5. **Comentários**: Documentar funções complexas e decisões importantes

## 🔗 Referências

- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/docs)
- [Zustand](https://zustand-demo.pmnd.rs/)
