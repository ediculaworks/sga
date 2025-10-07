# ⚡ Quick Start - Setup Rápido

Guia rápido para colocar o projeto funcionando em 5 minutos.

## 🚀 Setup em 5 Passos

### 1️⃣ Instalar Dependências
```bash
npm install
```

### 2️⃣ Iniciar Servidor
```bash
npm run dev
```

### 3️⃣ Configurar Supabase (Primeira Vez)

**Acesse:** http://localhost:3000/setup

1. Vá para [app.supabase.com](https://app.supabase.com)
2. Crie um projeto (ou use existente)
3. Vá em **Settings → API**
4. Copie:
   - **Project URL** → Cole no primeiro campo
   - **anon public key** → Cole no segundo campo
5. Clique em **"Testar Conexão"**
6. Se sucesso, copie as variáveis mostradas

### 4️⃣ Atualizar .env.local

Cole as variáveis no arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

**Reinicie o servidor** (Ctrl+C e depois `npm run dev`)

### 5️⃣ Criar Banco de Dados

1. No Supabase, vá em **SQL Editor**
2. Copie **TODO** o conteúdo de `supabase/schema.sql`
3. Cole e clique em **Run**
4. Aguarde a execução (±30 segundos)

## ✅ Pronto!

Seu sistema está rodando em:

- **🏠 Página Principal:** http://localhost:3000
- **🔧 Setup:** http://localhost:3000/setup
- **💊 Health Check:** http://localhost:3000/api/health

## 🎯 Próximos Passos

1. **Criar usuário admin:**
   ```sql
   -- No SQL Editor do Supabase:
   -- 1. Vá em Authentication → Users → Add user
   -- 2. Depois execute:
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'seu@email.com';
   ```

2. **Acessar o sistema:**
   - Login (em breve)
   - Dashboard (em breve)
   - Cadastros (em breve)

## 🐛 Problemas?

### "Missing environment variables"
- Confira se `.env.local` está na raiz do projeto
- Reinicie o servidor

### "Invalid API key"
- Use a chave **anon/public** (não a service_role)
- Copie novamente do Supabase

### "Tabelas não existem"
- Execute novamente `supabase/schema.sql`
- Verifique erros no SQL Editor

## 📚 Documentação Completa

- [README.md](./README.md) - Documentação principal
- [SETUP_SUPABASE.md](./SETUP_SUPABASE.md) - Guia detalhado do Supabase
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Estrutura do projeto

---

**Dúvidas? Consulte [SETUP_SUPABASE.md](./SETUP_SUPABASE.md) para guia completo**
