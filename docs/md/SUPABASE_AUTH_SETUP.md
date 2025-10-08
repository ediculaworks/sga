# Configuração do Supabase Auth

Este documento contém as instruções para configurar a autenticação no Supabase Dashboard.

## 🔐 Passo 1: Habilitar Autenticação por Email/Senha

1. Acesse o **Supabase Dashboard**: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, vá em **Authentication** → **Providers**
4. Encontre **Email** na lista de providers
5. Certifique-se de que está **habilitado** (toggle verde)
6. Configure as opções:
   - ✅ **Enable Email provider**
   - ✅ **Confirm email** (DESABILITAR para desenvolvimento - habilitar em produção)
   - ✅ **Secure email change** (opcional)

## 👥 Passo 2: Criar Usuário de Teste

### Opção A: Via Dashboard (Recomendado)

1. Vá em **Authentication** → **Users**
2. Clique em **Add user** → **Create new user**
3. Preencha:
   - **Email**: exemplo@teste.com
   - **Password**: teste123 (mínimo 6 caracteres)
   - **Auto Confirm User**: ✅ (marcar para pular confirmação de email)
4. Clique em **Create user**

### Opção B: Via SQL

Execute este SQL no **SQL Editor** do Supabase:

```sql
-- 1. Criar usuário no Supabase Auth
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'medico@teste.com',
  crypt('teste123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 2. Inserir dados do usuário na tabela usuarios
INSERT INTO public.usuarios (
  nome_completo,
  cpf,
  email,
  telefone,
  senha_hash,
  tipo_perfil,
  idade,
  sexo,
  ativo
) VALUES (
  'Dr. João Silva',
  '12345678900',
  'medico@teste.com',
  '11999999999',
  crypt('teste123', gen_salt('bf')),
  'MEDICO',
  35,
  'MASCULINO',
  true
);
```

## 🔒 Passo 3: Configurar Row Level Security (RLS)

Execute no **SQL Editor**:

```sql
-- ==========================================
-- POLÍTICAS RLS BÁSICAS
-- ==========================================

-- 1. Habilitar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambulancias ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencias_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE escala ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_ambulancias ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_tecnico_ambulancias ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_equipamentos_ambulancias ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rastreamento_ambulancias ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLÍTICAS PARA TABELA USUARIOS
-- ==========================================

-- Permitir que usuários autenticados leiam seus próprios dados
CREATE POLICY "Usuários podem ler seus próprios dados"
ON usuarios FOR SELECT
TO authenticated
USING (email = auth.jwt() ->> 'email');

-- Permitir que todos os usuários autenticados leiam dados de outros usuários
-- (necessário para ver equipes, motoristas, etc)
CREATE POLICY "Usuários autenticados podem ler outros usuários"
ON usuarios FOR SELECT
TO authenticated
USING (true);

-- Apenas chefes podem criar novos usuários
CREATE POLICY "Apenas chefes podem criar usuários"
ON usuarios FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE email = auth.jwt() ->> 'email'
    AND tipo_perfil IN ('CHEFE_MEDICOS', 'CHEFE_ENFERMEIROS', 'CHEFE_AMBULANCIAS')
  )
);

-- Usuários podem atualizar seus próprios dados básicos
CREATE POLICY "Usuários podem atualizar seus próprios dados"
ON usuarios FOR UPDATE
TO authenticated
USING (email = auth.jwt() ->> 'email')
WITH CHECK (email = auth.jwt() ->> 'email');

-- ==========================================
-- POLÍTICAS PARA OCORRÊNCIAS
-- ==========================================

-- Todos os usuários autenticados podem ler ocorrências
CREATE POLICY "Usuários autenticados podem ler ocorrências"
ON ocorrencias FOR SELECT
TO authenticated
USING (true);

-- Apenas chefes dos médicos podem criar ocorrências
CREATE POLICY "Apenas chefe dos médicos pode criar ocorrências"
ON ocorrencias FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE email = auth.jwt() ->> 'email'
    AND tipo_perfil = 'CHEFE_MEDICOS'
  )
);

-- Chefes e criadores podem atualizar ocorrências
CREATE POLICY "Chefes podem atualizar ocorrências"
ON ocorrencias FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE email = auth.jwt() ->> 'email'
    AND tipo_perfil IN ('CHEFE_MEDICOS', 'CHEFE_AMBULANCIAS')
  )
);

-- ==========================================
-- POLÍTICAS PARA AMBULÂNCIAS
-- ==========================================

-- Todos podem ler ambulâncias
CREATE POLICY "Usuários autenticados podem ler ambulâncias"
ON ambulancias FOR SELECT
TO authenticated
USING (true);

-- Apenas chefe das ambulâncias pode criar/editar
CREATE POLICY "Apenas chefe das ambulâncias pode gerenciar ambulâncias"
ON ambulancias FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE email = auth.jwt() ->> 'email'
    AND tipo_perfil = 'CHEFE_AMBULANCIAS'
  )
);

-- ==========================================
-- POLÍTICAS PARA PACIENTES
-- ==========================================

-- Médicos e enfermeiros podem ler pacientes
CREATE POLICY "Profissionais de saúde podem ler pacientes"
ON pacientes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE email = auth.jwt() ->> 'email'
    AND tipo_perfil IN ('MEDICO', 'ENFERMEIRO', 'CHEFE_MEDICOS', 'CHEFE_ENFERMEIROS')
  )
);

-- Médicos podem criar/editar pacientes
CREATE POLICY "Médicos podem gerenciar pacientes"
ON pacientes FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE email = auth.jwt() ->> 'email'
    AND tipo_perfil IN ('MEDICO', 'CHEFE_MEDICOS')
  )
);

-- ==========================================
-- POLÍTICAS PARA ATENDIMENTOS
-- ==========================================

-- Profissionais de saúde podem ler atendimentos
CREATE POLICY "Profissionais podem ler atendimentos"
ON atendimentos FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE email = auth.jwt() ->> 'email'
    AND tipo_perfil IN ('MEDICO', 'ENFERMEIRO', 'CHEFE_MEDICOS', 'CHEFE_ENFERMEIROS')
  )
);

-- Médicos podem criar atendimentos
CREATE POLICY "Médicos podem criar atendimentos"
ON atendimentos FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE email = auth.jwt() ->> 'email'
    AND tipo_perfil IN ('MEDICO', 'CHEFE_MEDICOS')
  )
);

-- ==========================================
-- POLÍTICAS PARA NOTIFICAÇÕES
-- ==========================================

-- Usuários podem ler suas próprias notificações
CREATE POLICY "Usuários podem ler suas notificações"
ON notificacoes FOR SELECT
TO authenticated
USING (
  destinatario_id IN (
    SELECT id FROM usuarios WHERE email = auth.jwt() ->> 'email'
  )
);

-- Usuários podem atualizar suas notificações (marcar como lida)
CREATE POLICY "Usuários podem atualizar suas notificações"
ON notificacoes FOR UPDATE
TO authenticated
USING (
  destinatario_id IN (
    SELECT id FROM usuarios WHERE email = auth.jwt() ->> 'email'
  )
);
```

## 🧪 Passo 4: Testar Autenticação

### Via Dashboard

1. Vá em **Authentication** → **Users**
2. Verifique se o usuário foi criado
3. Copie o email e senha para testar no app

### Via Aplicação

1. Inicie o servidor: `npm run dev`
2. Acesse: http://localhost:3000/login
3. Faça login com:
   - **Email**: medico@teste.com
   - **Senha**: teste123
4. Deve ser redirecionado para `/medico` (dashboard do médico)

## 📊 Usuários de Teste Sugeridos

Crie um usuário para cada perfil:

```sql
-- MÉDICO
INSERT INTO public.usuarios (nome_completo, cpf, email, senha_hash, tipo_perfil, ativo)
VALUES ('Dr. João Silva', '11111111111', 'medico@teste.com', crypt('teste123', gen_salt('bf')), 'MEDICO', true);

-- ENFERMEIRO
INSERT INTO public.usuarios (nome_completo, cpf, email, senha_hash, tipo_perfil, ativo)
VALUES ('Enf. Maria Santos', '22222222222', 'enfermeiro@teste.com', crypt('teste123', gen_salt('bf')), 'ENFERMEIRO', true);

-- MOTORISTA
INSERT INTO public.usuarios (nome_completo, cpf, email, senha_hash, tipo_perfil, ativo)
VALUES ('Carlos Oliveira', '33333333333', 'motorista@teste.com', crypt('teste123', gen_salt('bf')), 'MOTORISTA', true);

-- CHEFE DOS MÉDICOS
INSERT INTO public.usuarios (nome_completo, cpf, email, senha_hash, tipo_perfil, ativo)
VALUES ('Dr. Pedro Costa', '44444444444', 'chefemedicos@teste.com', crypt('teste123', gen_salt('bf')), 'CHEFE_MEDICOS', true);

-- CHEFE DOS ENFERMEIROS
INSERT INTO public.usuarios (nome_completo, cpf, email, senha_hash, tipo_perfil, ativo)
VALUES ('Enf. Ana Lima', '55555555555', 'chefeenfermeiros@teste.com', crypt('teste123', gen_salt('bf')), 'CHEFE_ENFERMEIROS', true);

-- CHEFE DAS AMBULÂNCIAS
INSERT INTO public.usuarios (nome_completo, cpf, email, senha_hash, tipo_perfil, ativo)
VALUES ('Roberto Alves', '66666666666', 'chefeambulancias@teste.com', crypt('teste123', gen_salt('bf')), 'CHEFE_AMBULANCIAS', true);
```

**Criar os usuários no Supabase Auth também:**

Para cada email acima, vá em **Authentication** → **Users** → **Add user** e crie com senha `teste123`.

## ⚠️ Importante

- **Desenvolvimento**: Desabilite a confirmação de email
- **Produção**: Habilite confirmação de email e configure SMTP
- As políticas RLS acima são básicas. Ajuste conforme necessário.
- Sempre teste as permissões antes de ir para produção.

## ✅ Checklist

- [ ] Email provider habilitado
- [ ] Confirmação de email desabilitada (dev)
- [ ] Usuários de teste criados (Auth + tabela usuarios)
- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas RLS criadas
- [ ] Testado login no app
- [ ] Testado redirecionamento por perfil
