-- ==========================================
-- VERIFICAR E CORRIGIR PERMISSÕES DA TABELA
-- ==========================================

-- 1. Ver permissões atuais da tabela usuarios
SELECT
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'usuarios';

-- 2. CONCEDER permissões para as roles anon e authenticated
GRANT SELECT ON usuarios TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON usuarios TO authenticated;

-- 3. Verificar novamente as permissões
SELECT
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'usuarios'
ORDER BY grantee, privilege_type;

-- 4. Testar se consegue ler agora
SELECT id, nome_completo, email, tipo_perfil
FROM usuarios
WHERE email = 'medico@teste.com';
