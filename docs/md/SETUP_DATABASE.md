# Configuração do Banco de Dados Supabase

Este guia fornece instruções passo a passo para configurar e integrar o banco de dados Supabase ao projeto SGA.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Supabase](#configuração-do-supabase)
3. [Configuração do Projeto](#configuração-do-projeto)
4. [Executando o Schema](#executando-o-schema)
5. [Verificação da Instalação](#verificação-da-instalação)
6. [Uso da Integração](#uso-da-integração)

## Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Node.js 18+ instalado
- npm ou yarn instalado

## Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Clique em "New Project"
3. Preencha os dados:
   - **Nome do Projeto**: SGA (ou o nome de sua preferência)
   - **Database Password**: Escolha uma senha forte (guarde-a em local seguro)
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
4. Clique em "Create new project"
5. Aguarde a criação do projeto (pode levar alguns minutos)

### 2. Obter Credenciais

Após a criação do projeto:

1. No menu lateral, clique em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Copie as seguintes informações:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon/public key** (chave pública)

## Configuração do Projeto

### 1. Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env.local
   ```

2. Edite o arquivo `.env.local` e adicione suas credenciais:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-aqui
   ```

### 2. Instalar Dependências

```bash
npm install
```

## Executando o Schema

O schema do banco de dados está localizado em `supabase/schema.sql` e deve ser executado no Supabase.

### Método 1: Usando o SQL Editor do Supabase (Recomendado)

1. No painel do Supabase, clique em **SQL Editor** no menu lateral
2. Clique em **New Query**
3. Abra o arquivo `supabase/schema.sql` do projeto
4. Copie todo o conteúdo do arquivo
5. Cole no SQL Editor do Supabase
6. Clique em **Run** para executar o script

O schema está dividido em partes. Execute cada parte na ordem:
- **Parte 1**: ENUMS e Tabelas de Usuários
- **Parte 2**: Tabelas de Ambulâncias
- **Parte 3**: Tabelas de Checklists
- **Parte 4**: Tabelas de Ocorrências
- **Parte 5**: Tabelas de Pacientes e Atendimentos
- **Parte 6**: Tabelas de Sistema
- **Parte 7**: Triggers Básicos
- **Parte 8**: Triggers de Lógica de Negócio
- **Parte 9**: Views para Relatórios

### Método 2: Usando a CLI do Supabase

```bash
# Instalar CLI do Supabase
npm install -g supabase

# Login no Supabase
supabase login

# Executar migrations
supabase db push
```

## Verificação da Instalação

### 1. Verificar Tabelas Criadas

No Supabase:
1. Clique em **Table Editor** no menu lateral
2. Você deve ver todas as tabelas criadas:
   - usuarios
   - motoristas
   - escala
   - ambulancias
   - equipamentos_catalogo
   - estoque_ambulancias
   - gastos_ambulancias
   - checklist_tecnico_ambulancias
   - checklist_equipamentos_ambulancias
   - checklist_equipamentos_itens
   - ocorrencias
   - ocorrencias_participantes
   - pacientes
   - atendimentos
   - atendimentos_arquivos
   - notas_enfermeiro_pacientes
   - consumo_materiais
   - notificacoes
   - rastreamento_ambulancias
   - logs_sistema

### 2. Testar Conexão

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse as rotas de teste:
- [http://localhost:3000/api/health](http://localhost:3000/api/health) - Verifica se a API está funcionando
- [http://localhost:3000/api/test-supabase](http://localhost:3000/api/test-supabase) - Testa conexão com Supabase

Se a conexão estiver correta, você verá uma mensagem de sucesso.

## Uso da Integração

### Estrutura do Projeto

```
src/
├── types/
│   └── index.ts          # Tipos TypeScript do banco de dados
├── lib/
│   ├── supabase/
│   │   ├── client.ts     # Cliente Supabase (browser)
│   │   └── server.ts     # Cliente Supabase (server)
│   ├── services/         # Serviços CRUD
│   │   ├── usuarios.ts
│   │   ├── ambulancias.ts
│   │   ├── ocorrencias.ts
│   │   ├── escala.ts
│   │   ├── equipamentos.ts
│   │   └── index.ts
│   └── utils/            # Utilitários
│       ├── validation.ts # Validações
│       ├── formatters.ts # Formatadores
│       └── queries.ts    # Queries especiais
└── hooks/                # Hooks React
    ├── useUsuarios.ts
    ├── useAmbulancias.ts
    └── useOcorrencias.ts
```

### Exemplos de Uso

#### 1. Usando Serviços

```typescript
import { usuariosService, ambulanciasService } from '@/lib/services';

// Buscar todos os usuários
const usuarios = await usuariosService.getAll();

// Buscar ambulâncias prontas
const ambulancias = await ambulanciasService.getProntas();

// Criar nova ocorrência
const ocorrencia = await ocorrenciasService.create({
  tipo_ambulancia: 'BASICA',
  tipo_trabalho: 'EMERGENCIA',
  // ... outros campos
});
```

#### 2. Usando Hooks em Componentes

```typescript
'use client';

import { useUsuarios } from '@/hooks/useUsuarios';
import { useAmbulancias } from '@/hooks/useAmbulancias';

export default function MeuComponente() {
  const { usuarios, loading, error } = useUsuarios();
  const { ambulancias } = useAmbulancias();

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {usuarios.map(usuario => (
        <div key={usuario.id}>{usuario.nome_completo}</div>
      ))}
    </div>
  );
}
```

#### 3. Usando Validações e Formatações

```typescript
import { validarCPF, formatarCPF } from '@/lib/utils/validation';
import { formatarMoeda, formatarData } from '@/lib/utils/formatters';

// Validar CPF
const cpfValido = validarCPF('12345678900'); // true/false

// Formatar valores
const cpfFormatado = formatarCPF('12345678900'); // 123.456.789-00
const valorFormatado = formatarMoeda(1500.50); // R$ 1.500,50
const dataFormatada = formatarData('2025-01-15'); // 15/01/2025
```

#### 4. Usando Queries Especiais

```typescript
import { queries } from '@/lib/utils/queries';

// Dashboard do dia
const dashboard = await queries.getDashboardDia('2025-01-15');

// Relatório mensal
const relatorio = await queries.getRelatorioMensal(2025, 1);

// Histórico de ambulância
const historico = await queries.getHistoricoAmbulancia(1);
```

## Políticas de Segurança (RLS)

O Supabase possui Row Level Security (RLS) desabilitado por padrão. Para produção, é recomendado:

1. Habilitar RLS nas tabelas sensíveis
2. Criar políticas de acesso baseadas em roles
3. Usar autenticação do Supabase

Exemplo de política:

```sql
-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Criar política de leitura
CREATE POLICY "Usuários podem ver apenas seus dados"
ON usuarios
FOR SELECT
USING (auth.uid() = id::text);
```

## Backup e Manutenção

### Backup Automático

O Supabase faz backups automáticos diários. Para restaurar:
1. Acesse **Database** > **Backups**
2. Escolha o backup desejado
3. Clique em **Restore**

### Backup Manual

```bash
# Via CLI do Supabase
supabase db dump -f backup.sql

# Restaurar
supabase db restore backup.sql
```

## Solução de Problemas

### Erro: "Missing Supabase environment variables"

- Verifique se o arquivo `.env.local` existe
- Confirme que as variáveis estão corretas
- Reinicie o servidor de desenvolvimento

### Erro: "Permission denied for table"

- Verifique se o RLS está configurado corretamente
- Confirme que está usando a chave correta (anon key para cliente)

### Erro ao executar migrations

- Execute as partes do schema na ordem correta
- Verifique se não há tabelas/tipos duplicados
- Limpe o banco e execute novamente se necessário

## Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Guia de TypeScript](https://supabase.com/docs/guides/api/generating-types)
- [Políticas RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub do projeto
- Consulte a documentação do Supabase
- Entre em contato com a equipe de desenvolvimento
