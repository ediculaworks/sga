# 🔧 Troubleshooting - Soluções de Problemas

Guia completo para resolver problemas comuns no Sistema de Gestão de Ambulâncias.

## 🚨 Problemas Comuns e Soluções

### 1. Erro: "Could not find the table 'public._test_'" ✅ RESOLVIDO

**Erro completo:**
```
Could not find the table 'public._test_' in the schema cache
```

**Causa:**
A API de teste estava tentando consultar uma tabela inexistente no banco de dados.

**Solução:**
✅ **JÁ CORRIGIDO!** O código foi atualizado para usar um método de teste que não depende de tabelas existentes.

**Como testar:**
1. Acesse: http://localhost:3000/setup
2. Cole suas credenciais do Supabase
3. Clique em "Testar Conexão"
4. Deve mostrar: "✅ Conexão estabelecida com sucesso!"

---

### 2. Erro: "Missing Supabase environment variables"

**Sintomas:**
- Erro ao inicializar o cliente Supabase
- Mensagem: "Missing Supabase environment variables"

**Solução:**

1. **Verifique se `.env.local` existe na raiz do projeto:**
   ```bash
   ls -la .env.local
   # Ou no Windows:
   dir .env.local
   ```

2. **Verifique o conteúdo:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
   ```

3. **Confirme que as variáveis começam com `NEXT_PUBLIC_`**

4. **Reinicie o servidor:**
   ```bash
   # Pare o servidor (Ctrl+C)
   npm run dev
   ```

---

### 3. Erro: "Invalid API key" ou "JWT"

**Sintomas:**
- Conexão falha com erro de autenticação
- Mensagem: "Invalid API key"

**Causas Comuns:**

1. **Usando a chave errada:**
   - ❌ ERRADO: `service_role` key
   - ✅ CERTO: `anon` ou `public` key

2. **Chave copiada incorretamente:**
   - Espaços extras
   - Chave incompleta

**Solução:**

1. Acesse: https://app.supabase.com/project/SEU_ID/settings/api
2. Encontre a seção **Project API keys**
3. Copie a chave **`anon`** ou **`public`** (NÃO a service_role!)
4. Cole EXATAMENTE como está, sem espaços

---

### 4. Servidor não inicia (porta 3000 ocupada)

**Sintomas:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solução 1: Mudar porta**
```bash
PORT=3001 npm run dev
```

**Solução 2: Liberar porta 3000 (Windows)**
```bash
# Encontrar processo usando a porta
netstat -ano | findstr :3000

# Matar o processo (substitua PID)
taskkill /PID <numero_do_pid> /F
```

**Solução 2: Liberar porta 3000 (Linux/Mac)**
```bash
# Encontrar processo
lsof -i :3000

# Matar processo
kill -9 <PID>
```

---

### 5. Não consigo acessar o projeto via IP de rede

**Problema:**
- http://localhost:3000 funciona
- http://192.168.x.x:3000 não funciona

**Soluções:**

**Windows:**
1. Abra o **Firewall do Windows**
2. Vá em **Regras de Entrada**
3. Crie nova regra:
   - Tipo: Porta
   - Porta: 3000
   - Ação: Permitir conexão
   - Nome: "Next.js Dev Server"

**Alternativa - Desabilitar firewall temporariamente:**
```bash
# Execute como administrador
netsh advfirewall set allprofiles state off
```

**Linux:**
```bash
# UFW
sudo ufw allow 3000

# iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

---

### 6. Erro ao executar schema.sql no Supabase

**Sintomas:**
- Erros ao rodar o script SQL
- Tabelas não são criadas

**Soluções:**

**1. Execute em partes:**
Em vez de executar tudo de uma vez, execute seção por seção:

```sql
-- Primeiro: Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Depois: Tabelas (uma por vez)
CREATE TABLE IF NOT EXISTS public.profiles (
  ...
);

-- Depois: Índices
-- Depois: RLS
-- Depois: Triggers
```

**2. Verifique permissões:**
Certifique-se de estar logado como proprietário do projeto.

**3. Limpe o banco (se necessário):**
```sql
-- ⚠️ CUIDADO: Isso apaga TUDO!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

---

### 7. Build falha com erro TypeScript

**Sintomas:**
```bash
npm run build
# Erro: Type errors
```

**Solução:**

1. **Limpe o cache:**
   ```bash
   rm -rf .next
   rm -rf node_modules
   npm install
   ```

2. **Verifique tipos:**
   ```bash
   npm run type-check
   # ou
   npx tsc --noEmit
   ```

3. **Atualize dependências:**
   ```bash
   npm update
   ```

---

### 8. Página fica em branco após build

**Sintomas:**
- `npm run dev` funciona
- `npm run build && npm start` mostra página em branco

**Solução:**

1. **Verifique o console do navegador** (F12)
2. **Verifique variáveis de ambiente:**
   ```bash
   # .env.local é ignorado em produção!
   # Use .env.production ou variáveis de ambiente do sistema
   ```

3. **Verifique erros de hidratação:**
   - Elementos diferentes no servidor vs cliente
   - Timestamps/datas sem formatação adequada

---

### 9. Supabase retorna "relation does not exist"

**Sintomas:**
```
relation "public.ambulancias" does not exist
```

**Causa:**
Tabelas não foram criadas no banco de dados.

**Solução:**

1. **Execute o schema SQL:**
   - Vá no Supabase SQL Editor
   - Copie `supabase/schema.sql`
   - Execute

2. **Verifique se as tabelas existem:**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

3. **Se não existirem, execute novamente o script**

---

### 10. RLS (Row Level Security) bloqueia operações

**Sintomas:**
- Queries retornam vazio mesmo com dados
- Inserts/Updates falham silenciosamente

**Causa:**
Políticas RLS bloqueando o acesso.

**Solução Temporária (DEV APENAS):**
```sql
-- ⚠️ APENAS EM DESENVOLVIMENTO!
ALTER TABLE public.ambulancias DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.motoristas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocorrencias DISABLE ROW LEVEL SECURITY;
```

**Solução Correta:**
1. Faça login no sistema
2. Use um usuário autenticado
3. Verifique as políticas RLS no schema.sql

---

## 📞 Ainda com problemas?

### Passos para obter ajuda:

1. **Verifique os logs:**
   ```bash
   # Logs do servidor Next.js
   # (visíveis no terminal onde rodou npm run dev)
   ```

2. **Console do navegador:**
   - Pressione F12
   - Vá na aba "Console"
   - Copie os erros

3. **Abra uma Issue:**
   - Vá em: https://github.com/ediculaworks/sga/issues
   - Inclua:
     - ✅ Descrição do problema
     - ✅ Mensagem de erro completa
     - ✅ Passos para reproduzir
     - ✅ Sistema operacional
     - ✅ Versão do Node.js (`node -v`)

---

## 🔍 Comandos Úteis para Diagnóstico

```bash
# Ver versões
node -v
npm -v

# Verificar se o servidor está rodando
curl http://localhost:3000/api/health

# Ver portas em uso
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Limpar tudo e recomeçar
rm -rf .next node_modules package-lock.json
npm install
npm run dev

# Verificar variáveis de ambiente
echo $NEXT_PUBLIC_SUPABASE_URL     # Linux/Mac
echo %NEXT_PUBLIC_SUPABASE_URL%    # Windows CMD
```

---

## 📚 Recursos Adicionais

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

---

**Última atualização:** 2025-10-07
