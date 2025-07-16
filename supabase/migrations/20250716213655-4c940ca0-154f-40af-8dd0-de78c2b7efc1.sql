-- FASE 5: Análise de Políticas RLS Anônimas e Potencialmente Inseguras

-- 1. Função para analisar políticas RLS potencialmente problemáticas
CREATE OR REPLACE FUNCTION public.analyze_rls_security_issues()
RETURNS TABLE(
  table_name text,
  policy_name text,
  policy_type text,
  security_level text,
  issue_description text,
  recommendation text,
  policy_definition text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.tablename::text,
    p.policyname::text,
    p.cmd::text,
    CASE 
      WHEN p.qual LIKE '%true%' AND p.cmd = 'SELECT' THEN '🔴 CRÍTICO'
      WHEN p.qual LIKE '%true%' AND p.cmd != 'SELECT' THEN '🔴 EXTREMAMENTE CRÍTICO'
      WHEN p.qual LIKE '%auth.uid() IS NOT NULL%' AND p.cmd != 'SELECT' THEN '⚠️ POTENCIAL RISCO'
      WHEN p.qual LIKE '%auth.uid() IS NOT NULL%' AND p.cmd = 'SELECT' THEN '🟡 REVISAR'
      WHEN p.qual LIKE '%OR true%' THEN '🔴 CRÍTICO'
      WHEN p.qual LIKE '%1 = 1%' THEN '🔴 CRÍTICO'
      ELSE '✅ APARENTEMENTE SEGURO'
    END::text,
    CASE 
      WHEN p.qual LIKE '%true%' AND p.cmd = 'SELECT' THEN 'Política permite acesso público total para leitura'
      WHEN p.qual LIKE '%true%' AND p.cmd != 'SELECT' THEN 'Política permite modificação pública total'
      WHEN p.qual LIKE '%OR true%' THEN 'Política contém bypass de segurança'
      WHEN p.qual LIKE '%1 = 1%' THEN 'Política contém condição sempre verdadeira'
      WHEN p.qual LIKE '%auth.uid() IS NOT NULL%' AND p.cmd != 'SELECT' THEN 'Permite qualquer usuário autenticado modificar'
      ELSE 'Política aparentemente segura'
    END::text,
    CASE 
      WHEN p.qual LIKE '%true%' AND p.cmd = 'SELECT' THEN 'Revisar se acesso público é realmente necessário'
      WHEN p.qual LIKE '%true%' AND p.cmd != 'SELECT' THEN 'URGENTE: Restringir acesso de modificação'
      WHEN p.qual LIKE '%OR true%' THEN 'URGENTE: Remover bypass de segurança'
      WHEN p.qual LIKE '%1 = 1%' THEN 'URGENTE: Corrigir condição sempre verdadeira'
      WHEN p.qual LIKE '%auth.uid() IS NOT NULL%' AND p.cmd != 'SELECT' THEN 'Adicionar validação de propriedade/permissão'
      ELSE 'Manter monitoramento'
    END::text,
    substr(p.qual, 1, 200)::text
  FROM pg_policies p
  WHERE p.schemaname = 'public'
  ORDER BY 
    CASE 
      WHEN p.qual LIKE '%true%' AND p.cmd != 'SELECT' THEN 1
      WHEN p.qual LIKE '%OR true%' THEN 2
      WHEN p.qual LIKE '%1 = 1%' THEN 3
      WHEN p.qual LIKE '%true%' AND p.cmd = 'SELECT' THEN 4
      WHEN p.qual LIKE '%auth.uid() IS NOT NULL%' AND p.cmd != 'SELECT' THEN 5
      ELSE 6
    END,
    p.tablename, p.policyname;
END;
$$;

-- 2. Relatório de tabelas sem RLS
CREATE OR REPLACE FUNCTION public.check_tables_without_rls()
RETURNS TABLE(
  table_name text,
  rls_status text,
  risk_level text,
  recommendation text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::text,
    CASE WHEN t.rowsecurity THEN 'HABILITADO' ELSE 'DESABILITADO' END::text,
    CASE WHEN NOT t.rowsecurity THEN '🔴 ALTO RISCO' ELSE '✅ PROTEGIDO' END::text,
    CASE WHEN NOT t.rowsecurity THEN 'URGENTE: Habilitar RLS e criar políticas' ELSE 'Manter RLS habilitado' END::text
  FROM pg_tables t
  WHERE t.schemaname = 'public'
  AND t.tablename NOT LIKE '%backup%'
  ORDER BY t.rowsecurity ASC, t.tablename;
END;
$$;

-- 3. Log da FASE 5
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'security_audit',
  'phase_5_rls_analysis_started',
  jsonb_build_object(
    'phase', '5_RLS_SECURITY_ANALYSIS',
    'status', 'INICIADA',
    'focus', 'Análise de políticas RLS anônimas e inseguras',
    'functions_created', ARRAY['analyze_rls_security_issues', 'check_tables_without_rls'],
    'next_steps', 'Executar análises e corrigir políticas problemáticas',
    'timestamp', now()
  ),
  auth.uid()
);

-- 4. Executar análise inicial automaticamente
SELECT 'FASE 5 INICIADA: Análise de Segurança RLS' as status;