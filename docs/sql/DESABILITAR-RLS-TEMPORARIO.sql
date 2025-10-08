-- ==========================================
-- SOLUÇÃO TEMPORÁRIA: DESABILITAR RLS
-- ==========================================
-- Isso vai permitir o login funcionar IMEDIATAMENTE
-- Você pode reabilitar depois quando descobrir o problema
-- ==========================================

-- Desabilitar RLS na tabela usuarios
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Verificar que foi desabilitado
SELECT
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename = 'usuarios';

-- Testar se consegue ler agora
SELECT id, nome_completo, email, tipo_perfil, ativo
FROM usuarios
WHERE email = 'medico@teste.com';
