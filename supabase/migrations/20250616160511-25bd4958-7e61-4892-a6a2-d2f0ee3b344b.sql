

-- Criar função para verificar status de RLS em todas as tabelas
CREATE OR REPLACE FUNCTION public.check_rls_status()
RETURNS TABLE(
  table_name text,
  rls_enabled boolean,
  has_policies boolean,
  policy_count bigint,
  security_status text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    t.tablename::text,
    t.rowsecurity as rls_enabled,
    CASE WHEN COUNT(p.policyname) > 0 THEN true ELSE false END as has_policies,
    COUNT(p.policyname) as policy_count,
    CASE 
      WHEN t.rowsecurity = true AND COUNT(p.policyname) > 0 THEN '✅ SEGURO'
      WHEN t.rowsecurity = false AND COUNT(p.policyname) > 0 THEN '⚠️ RLS DESABILITADO'
      WHEN t.rowsecurity = false AND COUNT(p.policyname) = 0 THEN '🔴 SEM PROTEÇÃO'
      ELSE '❓ VERIFICAR'
    END as security_status
  FROM pg_tables t
  LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
  WHERE t.schemaname = 'public'
  AND t.tablename NOT LIKE '%backup%'
  GROUP BY t.tablename, t.rowsecurity
  ORDER BY 
    CASE 
      WHEN t.rowsecurity = false AND COUNT(p.policyname) = 0 THEN 1
      WHEN t.rowsecurity = false AND COUNT(p.policyname) > 0 THEN 2
      ELSE 3
    END,
    t.tablename;
$$;

-- Adicionar comentário de documentação
COMMENT ON FUNCTION public.check_rls_status() IS 
'Função para monitorar o status de segurança RLS em todas as tabelas públicas';

