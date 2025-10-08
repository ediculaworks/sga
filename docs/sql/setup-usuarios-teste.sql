-- ==========================================
-- SCRIPT DE CONFIGURAÇÃO COMPLETA
-- Sistema de Gestão de Ambulâncias
-- ==========================================

-- ==========================================
-- PARTE 1: INSERIR USUÁRIOS NA TABELA USUARIOS
-- ==========================================

-- MÉDICO
INSERT INTO public.usuarios (nome_completo, cpf, email, telefone, senha_hash, tipo_perfil, idade, sexo, ativo)
VALUES ('Dr. João Silva', '11111111111', 'medico@teste.com', '11999999999', crypt('teste123', gen_salt('bf')), 'MEDICO', 35, 'MASCULINO', true)
ON CONFLICT (cpf) DO NOTHING;

-- ENFERMEIRO
INSERT INTO public.usuarios (nome_completo, cpf, email, telefone, senha_hash, tipo_perfil, idade, sexo, ativo)
VALUES ('Enf. Maria Santos', '22222222222', 'enfermeiro@teste.com', '11988888888', crypt('teste123', gen_salt('bf')), 'ENFERMEIRO', 28, 'FEMININO', true)
ON CONFLICT (cpf) DO NOTHING;

-- MOTORISTA
INSERT INTO public.usuarios (nome_completo, cpf, email, telefone, senha_hash, tipo_perfil, idade, sexo, ativo)
VALUES ('Carlos Oliveira', '33333333333', 'motorista@teste.com', '11977777777', crypt('teste123', gen_salt('bf')), 'MOTORISTA', 40, 'MASCULINO', true)
ON CONFLICT (cpf) DO NOTHING;

-- CHEFE DOS MÉDICOS
INSERT INTO public.usuarios (nome_completo, cpf, email, telefone, senha_hash, tipo_perfil, idade, sexo, ativo)
VALUES ('Dr. Pedro Costa', '44444444444', 'chefemedicos@teste.com', '11966666666', crypt('teste123', gen_salt('bf')), 'CHEFE_MEDICOS', 45, 'MASCULINO', true)
ON CONFLICT (cpf) DO NOTHING;

-- CHEFE DOS ENFERMEIROS
INSERT INTO public.usuarios (nome_completo, cpf, email, telefone, senha_hash, tipo_perfil, idade, sexo, ativo)
VALUES ('Enf. Ana Lima', '55555555555', 'chefeenfermeiros@teste.com', '11955555555', crypt('teste123', gen_salt('bf')), 'CHEFE_ENFERMEIROS', 38, 'FEMININO', true)
ON CONFLICT (cpf) DO NOTHING;

-- CHEFE DAS AMBULÂNCIAS
INSERT INTO public.usuarios (nome_completo, cpf, email, telefone, senha_hash, tipo_perfil, idade, sexo, ativo)
VALUES ('Roberto Alves', '66666666666', 'chefeambulancias@teste.com', '11944444444', crypt('teste123', gen_salt('bf')), 'CHEFE_AMBULANCIAS', 42, 'MASCULINO', true)
ON CONFLICT (cpf) DO NOTHING;

-- ==========================================
-- PARTE 2: HABILITAR RLS EM TODAS AS TABELAS
-- ==========================================

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
-- PARTE 3: POLÍTICAS RLS PARA USUARIOS
-- ==========================================

-- Dropar políticas existentes (caso já existam)
DROP POLICY IF EXISTS "Usuários podem ler seus próprios dados" ON usuarios;
DROP POLICY IF EXISTS "Usuários autenticados podem ler outros usuários" ON usuarios;
DROP POLICY IF EXISTS "Apenas chefes podem criar usuários" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON usuarios;

-- Permitir que todos os usuários autenticados leiam dados de outros usuários
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
-- PARTE 4: POLÍTICAS RLS PARA OCORRÊNCIAS
-- ==========================================

DROP POLICY IF EXISTS "Usuários autenticados podem ler ocorrências" ON ocorrencias;
DROP POLICY IF EXISTS "Apenas chefe dos médicos pode criar ocorrências" ON ocorrencias;
DROP POLICY IF EXISTS "Chefes podem atualizar ocorrências" ON ocorrencias;

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

-- Chefes podem atualizar ocorrências
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
-- PARTE 5: POLÍTICAS RLS PARA AMBULÂNCIAS
-- ==========================================

DROP POLICY IF EXISTS "Usuários autenticados podem ler ambulâncias" ON ambulancias;
DROP POLICY IF EXISTS "Apenas chefe das ambulâncias pode gerenciar ambulâncias" ON ambulancias;

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
-- PARTE 6: POLÍTICAS RLS PARA PACIENTES
-- ==========================================

DROP POLICY IF EXISTS "Profissionais de saúde podem ler pacientes" ON pacientes;
DROP POLICY IF EXISTS "Médicos podem gerenciar pacientes" ON pacientes;

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
-- PARTE 7: POLÍTICAS RLS PARA ATENDIMENTOS
-- ==========================================

DROP POLICY IF EXISTS "Profissionais podem ler atendimentos" ON atendimentos;
DROP POLICY IF EXISTS "Médicos podem criar atendimentos" ON atendimentos;

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
-- PARTE 8: POLÍTICAS RLS PARA NOTIFICAÇÕES
-- ==========================================

DROP POLICY IF EXISTS "Usuários podem ler suas notificações" ON notificacoes;
DROP POLICY IF EXISTS "Usuários podem atualizar suas notificações" ON notificacoes;

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

-- ==========================================
-- PARTE 9: POLÍTICAS RLS PARA OUTRAS TABELAS
-- ==========================================

-- OCORRÊNCIAS PARTICIPANTES - Todos podem ler e inserir
DROP POLICY IF EXISTS "Usuários podem ler participações" ON ocorrencias_participantes;
DROP POLICY IF EXISTS "Profissionais podem confirmar participação" ON ocorrencias_participantes;

CREATE POLICY "Usuários podem ler participações"
ON ocorrencias_participantes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Profissionais podem confirmar participação"
ON ocorrencias_participantes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE email = auth.jwt() ->> 'email'
    AND tipo_perfil IN ('MEDICO', 'ENFERMEIRO')
  )
);

-- ESCALA - Todos podem ler
DROP POLICY IF EXISTS "Usuários podem ler escala" ON escala;

CREATE POLICY "Usuários podem ler escala"
ON escala FOR SELECT
TO authenticated
USING (true);

-- EQUIPAMENTOS - Todos podem ler
DROP POLICY IF EXISTS "Usuários podem ler equipamentos" ON equipamentos_catalogo;

CREATE POLICY "Usuários podem ler equipamentos"
ON equipamentos_catalogo FOR SELECT
TO authenticated
USING (true);

-- ESTOQUE - Todos podem ler
DROP POLICY IF EXISTS "Usuários podem ler estoque" ON estoque_ambulancias;

CREATE POLICY "Usuários podem ler estoque"
ON estoque_ambulancias FOR SELECT
TO authenticated
USING (true);

-- RASTREAMENTO - Todos podem ler
DROP POLICY IF EXISTS "Usuários podem ler rastreamento" ON rastreamento_ambulancias;

CREATE POLICY "Usuários podem ler rastreamento"
ON rastreamento_ambulancias FOR SELECT
TO authenticated
USING (true);

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================

-- Verificar usuários criados
SELECT id, nome_completo, email, tipo_perfil, ativo FROM usuarios ORDER BY tipo_perfil;
