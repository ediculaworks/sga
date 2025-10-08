-- ============================================
-- CORREÇÃO DO SCHEMA: ocorrencias_participantes
-- ============================================
-- Permite vagas vazias (usuario_id NULL) até serem preenchidas

-- 1. Remover constraint UNIQUE existente
ALTER TABLE ocorrencias_participantes
DROP CONSTRAINT IF EXISTS ocorrencias_participantes_ocorrencia_id_usuario_id_key;

-- 2. Tornar usuario_id NULLABLE (permitir vagas em aberto)
ALTER TABLE ocorrencias_participantes
ALTER COLUMN usuario_id DROP NOT NULL;

-- 3. Criar nova constraint UNIQUE que permite NULL
-- Permite múltiplas vagas vazias, mas não permite duplicatas quando preenchidas
CREATE UNIQUE INDEX ocorrencias_participantes_usuario_unico
ON ocorrencias_participantes(ocorrencia_id, usuario_id)
WHERE usuario_id IS NOT NULL;

-- 4. Atualizar permissões RLS
ALTER TABLE ocorrencias_participantes ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "participantes_select_all" ON ocorrencias_participantes;
DROP POLICY IF EXISTS "participantes_insert_all" ON ocorrencias_participantes;
DROP POLICY IF EXISTS "participantes_update_all" ON ocorrencias_participantes;

-- Política de SELECT: todos autenticados podem ver
CREATE POLICY "participantes_select_all"
ON ocorrencias_participantes
FOR SELECT
TO authenticated
USING (true);

-- Política de INSERT: todos autenticados podem inserir
CREATE POLICY "participantes_insert_all"
ON ocorrencias_participantes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política de UPDATE: todos autenticados podem atualizar
CREATE POLICY "participantes_update_all"
ON ocorrencias_participantes
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Garantir permissões de tabela
GRANT SELECT, INSERT, UPDATE ON ocorrencias_participantes TO anon, authenticated;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar estrutura da tabela
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'ocorrencias_participantes'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'ocorrencias_participantes';
