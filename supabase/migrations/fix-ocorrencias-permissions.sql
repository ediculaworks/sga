-- ============================================================================
-- FIX: Permissões para criação de ocorrências (FASE 7.2)
-- ============================================================================
-- Este script corrige os erros de permissão ao criar ocorrências
-- Erros corrigidos:
-- - 403: permission denied for sequence ocorrencias_id_seq
-- - 400: ambulancias, estoque_ambulancias, ocorrencias_participantes
-- ============================================================================

-- 1. Conceder permissões em todas as sequences necessárias
GRANT USAGE, SELECT ON SEQUENCE ocorrencias_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE ocorrencias_participantes_id_seq TO authenticated;

-- 2. Políticas RLS para tabela OCORRENCIAS
-- Limpar políticas antigas
DROP POLICY IF EXISTS "Usuarios autenticados podem criar ocorrencias" ON ocorrencias;
DROP POLICY IF EXISTS "Usuarios autenticados podem ver ocorrencias" ON ocorrencias;
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar ocorrencias" ON ocorrencias;
DROP POLICY IF EXISTS "Usuarios autenticados podem deletar ocorrencias" ON ocorrencias;

-- Criar novas políticas
CREATE POLICY "Usuarios autenticados podem criar ocorrencias"
  ON ocorrencias
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados podem ver ocorrencias"
  ON ocorrencias
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados podem atualizar ocorrencias"
  ON ocorrencias
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados podem deletar ocorrencias"
  ON ocorrencias
  FOR DELETE
  TO authenticated
  USING (true);

-- 3. Políticas RLS para tabela OCORRENCIAS_PARTICIPANTES (corrigir erro 400)
-- Limpar políticas antigas
DROP POLICY IF EXISTS "Usuarios autenticados podem criar participantes" ON ocorrencias_participantes;
DROP POLICY IF EXISTS "Usuarios autenticados podem ver participantes" ON ocorrencias_participantes;
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar participantes" ON ocorrencias_participantes;
DROP POLICY IF EXISTS "Usuarios autenticados podem deletar participantes" ON ocorrencias_participantes;

-- Criar novas políticas
CREATE POLICY "Usuarios autenticados podem criar participantes"
  ON ocorrencias_participantes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados podem ver participantes"
  ON ocorrencias_participantes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados podem atualizar participantes"
  ON ocorrencias_participantes
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados podem deletar participantes"
  ON ocorrencias_participantes
  FOR DELETE
  TO authenticated
  USING (true);

-- 4. Políticas RLS para tabela AMBULANCIAS (corrigir erro 400)
-- Limpar políticas antigas
DROP POLICY IF EXISTS "Usuarios autenticados podem ver ambulancias" ON ambulancias;
DROP POLICY IF EXISTS "Usuarios autenticados podem criar ambulancias" ON ambulancias;
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar ambulancias" ON ambulancias;

-- Criar novas políticas
CREATE POLICY "Usuarios autenticados podem ver ambulancias"
  ON ambulancias
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados podem criar ambulancias"
  ON ambulancias
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados podem atualizar ambulancias"
  ON ambulancias
  FOR UPDATE
  TO authenticated
  USING (true);

-- 5. Políticas RLS para tabela ESTOQUE_AMBULANCIAS (corrigir erro 400)
-- Limpar políticas antigas
DROP POLICY IF EXISTS "Usuarios autenticados podem ver estoque_ambulancias" ON estoque_ambulancias;
DROP POLICY IF EXISTS "Usuarios autenticados podem criar estoque_ambulancias" ON estoque_ambulancias;
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar estoque_ambulancias" ON estoque_ambulancias;

-- Criar novas políticas
CREATE POLICY "Usuarios autenticados podem ver estoque_ambulancias"
  ON estoque_ambulancias
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados podem criar estoque_ambulancias"
  ON estoque_ambulancias
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados podem atualizar estoque_ambulancias"
  ON estoque_ambulancias
  FOR UPDATE
  TO authenticated
  USING (true);

-- 6. Verificar se RLS está habilitado em todas as tabelas
ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencias_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambulancias ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_ambulancias ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
-- Para executar:
-- 1. Acesse: https://supabase.com/dashboard/project/[seu-projeto]/sql/new
-- 2. Cole este script completo
-- 3. Clique em "Run"
-- 4. Teste criar uma ocorrência novamente
-- ============================================================================
