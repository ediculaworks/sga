# 🚑 Sistema de Gestão de Ambulâncias (SGA)

Sistema completo para gerenciamento de ambulâncias, motoristas, equipes e ocorrências desenvolvido com Next.js 14, TypeScript e Supabase.

## 📋 Sobre o Projeto

O Sistema de Gestão de Ambulâncias (SGA) é uma plataforma moderna e eficiente para gerenciar frotas de ambulâncias, equipes médicas, motoristas e atendimentos de emergência. O sistema oferece controle completo das operações, desde o cadastro de recursos até o acompanhamento em tempo real de ocorrências.

## 🚀 Tecnologias

Este projeto foi construído com as seguintes tecnologias:

- **[Next.js 14](https://nextjs.org/)** - Framework React com App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitário
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI reutilizáveis
- **[Supabase](https://supabase.com/)** - Backend as a Service (PostgreSQL)
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Gerenciamento de estado
- **[Lucide React](https://lucide.dev/)** - Ícones
- **[Sonner](https://sonner.emilkowal.ski/)** - Notificações toast

## 📁 Estrutura do Projeto

```
sga/
├── src/
│   ├── app/                    # App Router do Next.js
│   │   ├── (auth)/            # Rotas de autenticação
│   │   ├── (dashboard)/       # Rotas do dashboard
│   │   ├── api/               # API Routes
│   │   ├── globals.css        # Estilos globais
│   │   ├── layout.tsx         # Layout raiz
│   │   └── page.tsx           # Página inicial
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes shadcn/ui
│   │   └── shared/           # Componentes compartilhados
│   ├── lib/                   # Bibliotecas e utilidades
│   │   ├── supabase/         # Configuração Supabase
│   │   ├── services/         # Serviços CRUD do banco
│   │   ├── utils/            # Utilitários (validação, formatação, queries)
│   │   └── utils.ts          # Funções utilitárias
│   ├── types/                 # Definições TypeScript do banco de dados
│   ├── hooks/                 # React Hooks customizados
│   └── stores/                # Stores Zustand
├── supabase/                  # Arquivos do Supabase
│   └── schema.sql            # Schema do banco de dados
├── public/                    # Arquivos estáticos
├── .env.local                 # Variáveis de ambiente (local)
├── .env.example              # Template de variáveis de ambiente
├── SETUP_DATABASE.md         # Guia de configuração do banco
├── components.json           # Configuração shadcn/ui
├── tailwind.config.ts        # Configuração Tailwind
├── tsconfig.json             # Configuração TypeScript
└── next.config.ts            # Configuração Next.js
```

## 🔧 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** 18.17 ou superior
- **npm** ou **yarn** ou **pnpm**
- **Git**
- Conta no **[Supabase](https://supabase.com/)** (gratuita)

## ⚙️ Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/ediculaworks/sga.git
cd sga
```

2. **Instale as dependências**

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. **Configure as variáveis de ambiente**

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e preencha com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

> 💡 **Como obter as credenciais do Supabase:**
> 1. Acesse [app.supabase.com](https://app.supabase.com/)
> 2. Crie um novo projeto (ou selecione um existente)
> 3. Vá em Settings → API
> 4. Copie a "Project URL" e a "anon/public key"

4. **Execute o projeto em modo de desenvolvimento**

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

5. **Configure o Banco de Dados**

⚠️ **Importante**: O banco de dados deve ser configurado antes de usar o sistema.

Siga o guia completo de configuração: **[SETUP_DATABASE.md](./SETUP_DATABASE.md)**

Resumo dos passos:
- Crie um projeto no Supabase
- Execute o schema SQL (`supabase/schema.sql`) no SQL Editor do Supabase
- Configure as variáveis de ambiente no `.env.local`
- Teste a conexão em [http://localhost:3000/api/test-supabase](http://localhost:3000/api/test-supabase)

6. **Abra o navegador**

Acesse [http://localhost:3000](http://localhost:3000)

## 📦 Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Cria build de produção
npm run start        # Inicia o servidor de produção
npm run lint         # Executa o linter
npm run format       # Formata o código com Prettier
npm run format:check # Verifica formatação do código
```

## 🏗️ Build para Produção

```bash
# Cria o build otimizado
npm run build

# Inicia o servidor de produção
npm run start
```

## 🎨 Componentes UI

O projeto utiliza componentes do **shadcn/ui** incluindo:

- Button
- Card
- Input
- Label
- Select
- Toast (Sonner)

Todos os componentes estão localizados em `src/components/ui/` e podem ser personalizados conforme necessário.

## 🗄️ Banco de Dados

O projeto utiliza **PostgreSQL** através do **Supabase** com um schema completo incluindo:

### Tabelas Principais
- **Usuários**: Gerenciamento de profissionais (médicos, enfermeiros, motoristas, chefes)
- **Ambulâncias**: Cadastro e controle de ambulâncias
- **Ocorrências**: Registro de atendimentos e emergências
- **Pacientes**: Cadastro de pacientes atendidos
- **Escala**: Controle de disponibilidade de profissionais
- **Equipamentos**: Catálogo e estoque de equipamentos médicos
- **Checklists**: Verificações técnicas e de equipamentos
- **Rastreamento**: Localização GPS das ambulâncias
- **Notificações**: Sistema de alertas
- **Logs**: Auditoria do sistema

### Views e Relatórios
- Resumo de ocorrências por período
- Estatísticas de ambulâncias
- Profissionais disponíveis
- Estoque baixo de equipamentos
- Pagamentos pendentes

### Triggers Automáticos
- Atualização automática de timestamps
- Gestão de estoque após consumo
- Mudança de status de ambulâncias
- Cálculo de duração de ocorrências
- Verificação de revisão por kilometragem

📚 **Documentação completa**: [SETUP_DATABASE.md](./SETUP_DATABASE.md)

## 🔐 Autenticação

O sistema utiliza autenticação do Supabase com suporte para:

- Login por email/senha
- Recuperação de senha
- Diferentes níveis de acesso (admin, operador, motorista)

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

## 👥 Autores

- **Equipe Edicula Works** - [GitHub](https://github.com/ediculaworks)

## 📞 Suporte

Para suporte, abra uma issue no [GitHub](https://github.com/ediculaworks/sga/issues).

---

**Desenvolvido com ❤️ usando Next.js e Supabase**