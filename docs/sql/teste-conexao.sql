-- ==========================================
-- TESTE DE CONEXÃO E VERIFICAÇÃO
-- ==========================================

-- 1. Verificar se RLS está habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'usuarios';

-- 2. Listar todas as políticas da tabela usuarios
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'usuarios';

-- 3. Verificar se o email existe exatamente como esperado
SELECT
  id,
  nome_completo,
  email,
  tipo_perfil,
  ativo,
  LENGTH(email) as tamanho_email,
  -- Verificar espaços invisíveis
  email = 'medico@teste.com' as email_exato
FROM public.usuarios
WHERE email LIKE '%medico%';

-- 4. Comparação direta dos emails
SELECT
  u.email as email_usuarios,
  au.email as email_auth,
  u.email = au.email as emails_batem
FROM public.usuarios u
FULL OUTER JOIN auth.users au ON LOWER(TRIM(u.email)) = LOWER(TRIM(au.email))
WHERE u.email LIKE '%medico%' OR au.email LIKE '%medico%';

-- 5. Tentar desabilitar RLS temporariamente para teste
-- CUIDADO: Apenas para diagnóstico!
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Testar query
SELECT id, nome_completo, email, tipo_perfil FROM usuarios WHERE email = 'medico@teste.com';

-- Reabilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
