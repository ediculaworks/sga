-- ============================================================================
-- REFATORAÇÃO: Sistema de Alocação de Profissionais
-- ============================================================================
-- Esta migration adiciona suporte para designação direta de profissionais
-- ao criar ocorrências, permitindo 3 tipos de vagas:
-- 1. Vaga Aberta para Médico (qualquer médico pode se candidatar)
-- 2. Vaga Aberta para Enfermeiro (qualquer enfermeiro pode se candidatar)
-- 3. Vaga Designada (profissional específico já escolhido)
-- ============================================================================

-- 1. Adicionar campo 'usuario_designado_id' em ocorrencias_participantes
-- Este campo indica se a vaga foi criada com um profissional já designado
ALTER TABLE ocorrencias_participantes
ADD COLUMN usuario_designado_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL;

-- 2. Adicionar comentários para documentação
COMMENT ON COLUMN ocorrencias_participantes.usuario_designado_id IS
'ID do usuário designado DIRETAMENTE pelo chefe ao criar a ocorrência.
Se preenchido, esta vaga NÃO aparece para candidatura - o profissional já está alocado.
Se NULL, é uma vaga aberta para candidatura.';

COMMENT ON COLUMN ocorrencias_participantes.usuario_id IS
'ID do usuário que CONFIRMOU participação nesta vaga.
- Se usuario_designado_id != NULL: será igual a usuario_designado_id (confirmado automaticamente)
- Se usuario_designado_id = NULL: será preenchido quando profissional se candidatar';

-- 3. Adicionar índice para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_ocorrencias_participantes_usuario_designado
ON ocorrencias_participantes(usuario_designado_id)
WHERE usuario_designado_id IS NOT NULL;

-- 4. Atualizar RLS policies para permitir visualização de vagas designadas
-- (As policies existentes já permitem acesso com USING (true), então não precisamos alterar)

-- ============================================================================
-- LÓGICA DE NEGÓCIO:
-- ============================================================================
-- Ao criar ocorrência:
--   - Vaga Aberta: { funcao: 'MEDICO', usuario_id: NULL, usuario_designado_id: NULL, confirmado: false }
--   - Vaga Designada: { funcao: 'MEDICO', usuario_id: 123, usuario_designado_id: 123, confirmado: true }
--
-- Ao profissional se candidatar (apenas vagas abertas):
--   - Verifica: usuario_designado_id = NULL (garante que é vaga aberta)
--   - Atualiza: usuario_id = [id do profissional], confirmado = true
--
-- Ao listar ocorrências disponíveis:
--   - Filtra: usuario_designado_id = NULL (apenas vagas abertas)
--   - Filtra: confirmado = false (ainda não preenchidas)
--
-- Status da ocorrência muda para CONFIRMADA quando:
--   - TODAS as vagas (abertas + designadas) têm confirmado = true
-- ============================================================================

-- 5. Validação: Se usuario_designado_id está preenchido, confirmado deve ser true
ALTER TABLE ocorrencias_participantes
ADD CONSTRAINT check_usuario_designado_confirmado
CHECK (
  (usuario_designado_id IS NULL) OR
  (usuario_designado_id IS NOT NULL AND confirmado = true)
);

-- 6. Validação: Se usuario_designado_id está preenchido, usuario_id deve ser igual
ALTER TABLE ocorrencias_participantes
ADD CONSTRAINT check_usuario_designado_matches_usuario
CHECK (
  (usuario_designado_id IS NULL) OR
  (usuario_designado_id = usuario_id)
);

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
