-- ==========================================
-- DIAGNÓSTICO: VERIFICAR USUÁRIOS
-- ==========================================

-- 1. Verificar usuários na tabela 'usuarios'
SELECT
  id,
  nome_completo,
  email,
  tipo_perfil,
  ativo,
  created_at
FROM public.usuarios
ORDER BY tipo_perfil;

-- 2. Verificar usuários no Supabase Auth
-- (Execute no SQL Editor do Supabase)
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY email;

-- 3. Comparar emails (encontrar diferenças)
-- Usuários no Auth que NÃO estão na tabela usuarios
SELECT
  au.email as email_auth,
  'Não encontrado na tabela usuarios' as status
FROM auth.users au
LEFT JOIN public.usuarios u ON au.email = u.email
WHERE u.email IS NULL;

-- 4. Usuários na tabela usuarios que NÃO estão no Auth
SELECT
  u.email as email_tabela,
  'Não encontrado no Auth' as status
FROM public.usuarios u
LEFT JOIN auth.users au ON u.email = au.email
WHERE au.email IS NULL;
