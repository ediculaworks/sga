# 🔧 Guia Completo de Setup do Supabase

Este guia vai ajudá-lo a configurar o Supabase passo a passo para o Sistema de Gestão de Ambulâncias.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com) (gratuita)
- Projeto Next.js já instalado localmente
- Node.js 18+ instalado

## 🚀 Passo 1: Criar Projeto no Supabase

1. **Acesse o Supabase**
   - Vá para [app.supabase.com](https://app.supabase.com)
   - Faça login ou crie uma conta

2. **Criar Novo Projeto**
   - Clique em "New Project"
   - Preencha os dados:
     - **Name**: `sga` ou `sistema-gestao-ambulancias`
     - **Database Password**: Crie uma senha forte (GUARDE ELA!)
     - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
   - Clique em "Create new project"
   - ⏳ Aguarde 2-3 minutos enquanto o projeto é criado

## 🔑 Passo 2: Obter Credenciais

1. **Acessar API Settings**
   - No menu lateral, clique em "Settings" (ícone de engrenagem)
   - Depois clique em "API"

2. **Copiar Credenciais**
   Você verá duas informações importantes:

   **Project URL:**
   ```
   https://xxxxxxxxxxx.supabase.co
   ```

   **anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   ⚠️ **IMPORTANTE:** NÃO compartilhe a `service_role` key publicamente!

## 🔧 Passo 3: Configurar Variáveis de Ambiente

### Opção A: Via Interface (Recomendado)

1. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

2. **Acesse a página de setup**
   ```
   http://localhost:3000/setup
   ```

3. **Cole suas credenciais**
   - Cole a Project URL no primeiro campo
   - Cole a anon/public key no segundo campo
   - Clique em "Testar Conexão"

4. **Se bem-sucedido**, copie as variáveis mostradas na tela

### Opção B: Manual

1. **Edite o arquivo `.env.local`**

   Abra o arquivo `.env.local` na raiz do projeto e substitua:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui

   # Ambiente
   NODE_ENV=development
   ```

2. **Salve o arquivo**

3. **Reinicie o servidor**
   ```bash
   # Pare o servidor (Ctrl+C)
   # Inicie novamente
   npm run dev
   ```

## 🗄️ Passo 4: Criar Schema do Banco de Dados

1. **Acesse o SQL Editor**
   - No Supabase, vá em "SQL Editor" no menu lateral
   - Ou acesse diretamente: `https://app.supabase.com/project/SEU_ID/sql`

2. **Executar Script**
   - Clique em "New query"
   - Copie TODO o conteúdo do arquivo `supabase/schema.sql`
   - Cole no editor
   - Clique em "Run" (ou pressione Ctrl+Enter)

3. **Verificar Criação**
   - Vá em "Table Editor" no menu lateral
   - Você deve ver as seguintes tabelas:
     - ✅ profiles
     - ✅ ambulancias
     - ✅ motoristas
     - ✅ ocorrencias
     - ✅ logs_atividades

## 👤 Passo 5: Criar Primeiro Usuário Admin

1. **Acesse Authentication**
   - No Supabase, vá em "Authentication" → "Users"

2. **Criar Novo Usuário**
   - Clique em "Add user" → "Create new user"
   - Preencha:
     - **Email**: seu@email.com
     - **Password**: sua_senha_segura
     - **Auto Confirm User**: ✅ (marque esta opção)
   - Clique em "Create user"

3. **Tornar Admin (SQL)**
   - Vá em "SQL Editor"
   - Execute este comando (substitua o email):

   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'seu@email.com';
   ```

## ✅ Passo 6: Testar Conexão

### Teste 1: API Health Check

```bash
curl http://localhost:3000/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-10-07T...",
  "service": "Sistema de Gestão de Ambulâncias"
}
```

### Teste 2: Página de Setup

1. Acesse: `http://localhost:3000/setup`
2. Cole suas credenciais
3. Clique em "Testar Conexão"
4. Deve mostrar: ✅ "Conexão bem-sucedida!"

### Teste 3: Verificar Tabelas

Execute no SQL Editor:

```sql
-- Ver todas as tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Contar registros em cada tabela
SELECT 'profiles' as tabela, COUNT(*) as total FROM public.profiles
UNION ALL
SELECT 'ambulancias', COUNT(*) FROM public.ambulancias
UNION ALL
SELECT 'motoristas', COUNT(*) FROM public.motoristas
UNION ALL
SELECT 'ocorrencias', COUNT(*) FROM public.ocorrencias;
```

## 🎨 Passo 7: Acessar o Sistema

1. **Acesse a página inicial**
   ```
   http://localhost:3000
   ```

2. **Você deve ver a página inicial do SGA**

## 🐛 Troubleshooting (Solução de Problemas)

### Erro: "Missing Supabase environment variables"

**Solução:**
- Verifique se `.env.local` está na raiz do projeto
- Confirme que as variáveis começam com `NEXT_PUBLIC_`
- Reinicie o servidor (`npm run dev`)

### Erro: "Invalid API key"

**Solução:**
- Confirme que copiou a chave **anon/public** (não a service_role)
- Verifique se não há espaços extras ao copiar
- Tente gerar uma nova chave em Settings → API

### Erro: "relation does not exist"

**Solução:**
- Execute novamente o script `supabase/schema.sql`
- Verifique se houve erros na execução
- Confira se está no projeto correto do Supabase

### Erro: "Connection refused"

**Solução:**
- Verifique se o projeto Supabase está ativo
- Confirme a URL do projeto (sem barras no final)
- Teste a conexão em: `http://localhost:3000/setup`

## 📊 Próximos Passos

Após concluir o setup:

1. ✅ Supabase configurado e conectado
2. ✅ Banco de dados criado
3. ✅ Usuário admin criado

**Agora você pode:**

- [ ] Fazer login no sistema
- [ ] Cadastrar ambulâncias
- [ ] Cadastrar motoristas
- [ ] Criar ocorrências
- [ ] Visualizar dashboard

## 🔒 Segurança

### ⚠️ NUNCA FAÇA:

- ❌ Commitar `.env.local` no Git (já está no .gitignore)
- ❌ Compartilhar sua `service_role` key
- ❌ Expor credenciais em código público
- ❌ Usar a mesma senha em produção e desenvolvimento

### ✅ SEMPRE FAÇA:

- ✅ Use senhas fortes
- ✅ Mantenha `.env.local` privado
- ✅ Ative 2FA no Supabase
- ✅ Revise políticas RLS regularmente

## 📚 Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

## 💬 Suporte

Problemas? Abra uma issue no GitHub ou consulte:
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)

---

**Configurado com sucesso? Hora de começar a desenvolver! 🚀**
