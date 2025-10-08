-- Verificar se as políticas foram criadas
SELECT
  policyname,
  roles,
  cmd,
  permissive,
  qual::text as using_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'usuarios';

-- Verificar se RLS está habilitado
SELECT
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename = 'usuarios';
