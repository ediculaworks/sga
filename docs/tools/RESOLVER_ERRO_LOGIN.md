# 🔧 Como Resolver o Erro "Invalid Login Credentials"

## 📋 Problema

Erro **400 Bad Request** com mensagem "Invalid login credentials" ao tentar fazer login.

## 🔍 Causa

Os usuários foram criados **apenas na tabela `usuarios`** do banco de dados PostgreSQL, mas **NÃO foram criados no Supabase Auth**.

O sistema usa Supabase Auth para autenticação, então é necessário criar os usuários em ambos os lugares.

## ✅ Solução (2 opções)

### **Opção 1: Criar usuários via Dashboard do Supabase (Mais rápido)**

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://app.supabase.com/
   - Entre no seu projeto: `tclvrcgoxqsimbqtnyla`

2. **Vá em Authentication → Users:**
   - No menu lateral: **Authentication** → **Users**
   - Clique em **"Add user"** → **"Create new user"**

3. **Crie cada usuário manualmente:**

   | Email | Senha | Observação |
   |-------|-------|------------|
   | `medico@teste.com` | `senha123` | Perfil: MEDICO |
   | `enfermeiro@teste.com` | `senha123` | Perfil: ENFERMEIRO |
   | `motorista@teste.com` | `senha123` | Perfil: MOTORISTA |
   | `chefemedicos@teste.com` | `senha123` | Perfil: CHEFE_MEDICOS |
   | `chefeenfermeiros@teste.com` | `senha123` | Perfil: CHEFE_ENFERMEIROS |
   | `chefeambulancia@teste.com` | `senha123` | Perfil: CHEFE_AMBULANCIAS |

4. **IMPORTANTE:** Marque a opção **"Auto Confirm User"** ao criar cada usuário

---

### **Opção 2: Criar via Script (Automático)**

Se preferir criar todos de uma vez via script:

1. **Obter a Service Role Key:**
   - No Supabase Dashboard: **Settings** → **API**
   - Copie a chave **"service_role"** (NÃO é a anon key!)
   - ⚠️ **ATENÇÃO**: Esta chave é SECRETA! Não exponha publicamente!

2. **Adicionar ao .env.local:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
   ```

3. **Instalar dependência tsx:**
   ```bash
   npm install -D tsx
   ```

4. **Executar o script:**
   ```bash
   npx tsx scripts/create-auth-users.ts
   ```

5. **Resultado esperado:**
   ```
   🚀 Iniciando criação de usuários no Supabase Auth...

   📧 Criando usuário: medico@teste.com
      ✅ Criado com sucesso! (ID: abc123...)

   ...

   ✨ Processo concluído!
   ```

---

## 🧪 Testar o Login

Após criar os usuários, teste o login:

1. **Via WiFi (rede local):**
   - Descubra seu IP: `ipconfig` (Windows) → procure "Endereço IPv4"
   - Acesse: `http://SEU_IP:3000/login`
   - Exemplo: `http://192.168.1.100:3000/login`

2. **Via localhost:**
   - Acesse: `http://localhost:3000/login`

3. **Credenciais de teste:**
   - Email: `medico@teste.com`
   - Senha: `senha123`

---

## ❓ Por que isso aconteceu?

O **Prompt 3.1** focou em criar a estrutura do dashboard, mas os usuários no Supabase Auth não foram criados ainda. Isso deveria ter sido feito na **Fase 1 (Autenticação)** do plano de ações.

**Solução atual:** Criar os usuários manualmente agora e seguir em frente.

---

## 🎯 Próximos Passos

Depois de resolver o login:

1. ✅ Testar login com diferentes perfis
2. ✅ Verificar redirecionamento para dashboard correto
3. ✅ Continuar desenvolvimento das funcionalidades

---

## 📞 Precisa de Ajuda?

Se ainda tiver problemas:

1. Verifique se o email está **exatamente igual** na tabela `usuarios` e no Supabase Auth
2. Confirme que a senha tem pelo menos 6 caracteres
3. Verifique se o usuário está com status **"Confirmed"** no Supabase Auth
4. Limpe o cache do navegador e tente novamente

---

**Última atualização:** 08/10/2025
