
-- ETAPA 3: VALIDAÇÃO E TESTE DE SEGURANÇA
-- Criar funções de validação e análise para verificar a eficácia das correções

-- 1. FUNÇÃO DE ANÁLISE COMPLETA DE PROBLEMAS RLS
CREATE OR REPLACE FUNCTION public.analyze_rls_security_issues()
RETURNS TABLE(
  table_name text,
  policy_name text,
  security_level text,
  issue_description text,
  recommendations text,
  severity integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  -- Verificar políticas que permitem acesso anônimo
  SELECT 
    schemaname::text,
    policyname::text,
    'CRÍTICO - ACESSO ANÔNIMO'::text,
    'Política permite acesso sem autenticação'::text,
    'Adicionar verificação auth.uid() IS NOT NULL'::text,
    10::integer
  FROM pg_policies 
  WHERE schemaname = 'public'
  AND (
    qual IS NULL OR 
    qual NOT LIKE '%auth.uid()%' OR
    with_check IS NULL OR
    with_check NOT LIKE '%auth.uid()%'
  )
  AND tablename IN (
    'profiles', 'admin_communications', 'invites', 
    'admin_settings', 'audit_logs', 'analytics'
  )
  
  UNION ALL
  
  -- Verificar tabelas sem RLS habilitado
  SELECT 
    t.table_name::text,
    'N/A'::text,
    'CRÍTICO - RLS DESABILITADO'::text,
    'Tabela não possui Row Level Security habilitado'::text,
    'Executar: ALTER TABLE ' || t.table_name || ' ENABLE ROW LEVEL SECURITY'::text,
    9::integer
  FROM information_schema.tables t
  LEFT JOIN pg_class c ON c.relname = t.table_name
  LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND n.nspname = 'public'
  AND NOT c.relrowsecurity
  AND t.table_name NOT LIKE '%backup%'
  AND t.table_name NOT LIKE 'supabase_%'
  
  UNION ALL
  
  -- Verificar funções sem search_path seguro
  SELECT 
    p.proname::text,
    'FUNÇÃO'::text,
    'ALTA - SEARCH PATH INSEGURO'::text,
    'Função SECURITY DEFINER sem search_path definido'::text,
    'Adicionar SET search_path TO ''''public'''' ou SET search_path TO '''''::text,
    7::integer
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND prosecdef = true
  AND NOT EXISTS (
    SELECT 1 FROM pg_proc_config(p.oid) 
    WHERE unnest LIKE 'search_path%'
  )
  
  ORDER BY severity DESC;
END;
$$;

-- 2. FUNÇÃO PARA VERIFICAR TABELAS SEM RLS
CREATE OR REPLACE FUNCTION public.check_tables_without_rls()
RETURNS TABLE(
  table_name text,
  has_user_id boolean,
  risk_level text,
  recommended_action text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::text,
    EXISTS(
      SELECT 1 FROM information_schema.columns c 
      WHERE c.table_name = t.table_name 
      AND c.table_schema = 'public'
      AND c.column_name IN ('user_id', 'created_by', 'owner_id')
    ) as has_user_id,
    CASE 
      WHEN NOT c.relrowsecurity AND EXISTS(
        SELECT 1 FROM information_schema.columns col 
        WHERE col.table_name = t.table_name 
        AND col.table_schema = 'public'
        AND col.column_name IN ('user_id', 'created_by', 'owner_id')
      ) THEN 'ALTO RISCO'
      WHEN NOT c.relrowsecurity THEN 'MÉDIO RISCO'
      ELSE 'SEGURO'
    END::text as risk_level,
    CASE 
      WHEN NOT c.relrowsecurity THEN 'ALTER TABLE ' || t.table_name || ' ENABLE ROW LEVEL SECURITY; + políticas adequadas'
      ELSE 'Nenhuma ação necessária'
    END::text as recommended_action
  FROM information_schema.tables t
  LEFT JOIN pg_class c ON c.relname = t.table_name
  LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND n.nspname = 'public'
  AND t.table_name NOT LIKE '%backup%'
  AND t.table_name NOT LIKE 'supabase_%'
  ORDER BY 
    CASE risk_level
      WHEN 'ALTO RISCO' THEN 1
      WHEN 'MÉDIO RISCO' THEN 2
      ELSE 3
    END;
END;
$$;

-- 3. FUNÇÃO DE TESTE DE SEGURANÇA EM TEMPO REAL
CREATE OR REPLACE FUNCTION public.security_health_dashboard()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  critical_issues integer;
  high_issues integer;
  medium_issues integer;
  tables_without_rls integer;
  functions_without_search_path integer;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Acesso negado - Apenas administradores');
  END IF;
  
  -- Contar problemas críticos
  SELECT COUNT(*) INTO critical_issues
  FROM public.analyze_rls_security_issues()
  WHERE severity >= 9;
  
  -- Contar problemas de alta prioridade
  SELECT COUNT(*) INTO high_issues
  FROM public.analyze_rls_security_issues()
  WHERE severity BETWEEN 7 AND 8;
  
  -- Contar problemas médios
  SELECT COUNT(*) INTO medium_issues
  FROM public.analyze_rls_security_issues()
  WHERE severity BETWEEN 4 AND 6;
  
  -- Contar tabelas sem RLS
  SELECT COUNT(*) INTO tables_without_rls
  FROM public.check_tables_without_rls()
  WHERE risk_level LIKE '%RISCO%';
  
  -- Contar funções sem search_path
  SELECT COUNT(*) INTO functions_without_search_path
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND prosecdef = true
  AND NOT EXISTS (
    SELECT 1 FROM pg_proc_config(p.oid) 
    WHERE unnest LIKE 'search_path%'
  );
  
  -- Construir resultado
  result := jsonb_build_object(
    'security_status', 
      CASE 
        WHEN critical_issues = 0 AND high_issues <= 2 THEN 'SEGURO'
        WHEN critical_issues <= 3 THEN 'ATENÇÃO'
        ELSE 'CRÍTICO'
      END,
    'summary', jsonb_build_object(
      'critical_issues', critical_issues,
      'high_priority_issues', high_issues,
      'medium_priority_issues', medium_issues,
      'tables_without_rls', tables_without_rls,
      'functions_without_search_path', functions_without_search_path
    ),
    'recommendations', CASE 
      WHEN critical_issues > 0 THEN 'Corrigir problemas críticos imediatamente'
      WHEN high_issues > 5 THEN 'Revisar e corrigir problemas de alta prioridade'
      ELSE 'Continuar monitoramento regular'
    END,
    'last_check', now(),
    'next_check_recommended', now() + interval '1 week'
  );
  
  RETURN result;
END;
$$;

-- 4. FUNÇÃO DE TESTE AUTOMATIZADO
CREATE OR REPLACE FUNCTION public.run_security_tests()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  test_results jsonb := '[]'::jsonb;
  test_result jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Acesso negado');
  END IF;
  
  -- TESTE 1: Verificar se funções críticas estão seguras
  SELECT jsonb_build_object(
    'test_name', 'Funções Críticas Seguras',
    'status', CASE 
      WHEN COUNT(*) = 0 THEN 'PASSOU'
      ELSE 'FALHOU'
    END,
    'details', 'Funções SECURITY DEFINER sem search_path: ' || COUNT(*)::text
  ) INTO test_result
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND prosecdef = true
  AND p.proname IN ('is_user_admin', 'log_critical_action', 'update_learning_updated_at')
  AND NOT EXISTS (
    SELECT 1 FROM pg_proc_config(p.oid) 
    WHERE unnest LIKE 'search_path%'
  );
  
  test_results := test_results || test_result;
  
  -- TESTE 2: Verificar se tabelas críticas têm RLS
  SELECT jsonb_build_object(
    'test_name', 'Tabelas Críticas com RLS',
    'status', CASE 
      WHEN COUNT(*) = 0 THEN 'PASSOU'
      ELSE 'FALHOU'
    END,
    'details', 'Tabelas críticas sem RLS: ' || array_agg(table_name)::text
  ) INTO test_result
  FROM public.check_tables_without_rls()
  WHERE table_name IN ('profiles', 'admin_communications', 'invites')
  AND risk_level LIKE '%RISCO%';
  
  test_results := test_results || test_result;
  
  -- TESTE 3: Verificar se políticas anônimas foram removidas
  SELECT jsonb_build_object(
    'test_name', 'Políticas Anônimas Removidas',
    'status', CASE 
      WHEN COUNT(*) = 0 THEN 'PASSOU'
      ELSE 'FALHOU'
    END,
    'details', 'Políticas ainda permitindo acesso anônimo: ' || COUNT(*)::text
  ) INTO test_result
  FROM pg_policies 
  WHERE schemaname = 'public'
  AND tablename IN ('admin_communications', 'invites', 'admin_settings')
  AND (qual IS NULL OR qual NOT LIKE '%auth.uid()%');
  
  test_results := test_results || test_result;
  
  RETURN jsonb_build_object(
    'test_suite', 'Validação de Segurança - Etapa 3',
    'execution_time', now(),
    'total_tests', jsonb_array_length(test_results),
    'results', test_results
  );
END;
$$;

-- 5. LOG DA ETAPA 3
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity
) VALUES (
  'security_validation',
  'phase_3_validation_testing_setup',
  jsonb_build_object(
    'phase', '3 - Validação e Teste',
    'functions_created', ARRAY[
      'analyze_rls_security_issues() - Análise completa de problemas RLS',
      'check_tables_without_rls() - Verificação de tabelas sem RLS',
      'security_health_dashboard() - Dashboard de saúde de segurança',
      'run_security_tests() - Testes automatizados de segurança'
    ],
    'capabilities', ARRAY[
      'Detecção automática de vulnerabilidades',
      'Classificação por severidade',
      'Recomendações específicas',
      'Testes automatizados',
      'Dashboard em tempo real'
    ],
    'next_steps', ARRAY[
      'Executar run_security_tests() para validar correções',
      'Monitorar security_health_dashboard() regularmente',
      'Revisar analyze_rls_security_issues() periodicamente'
    ],
    'timestamp', now()
  ),
  'info'
);

-- 6. RESULTADO DA ETAPA 3
SELECT 'ETAPA 3 CONCLUÍDA - SISTEMA DE VALIDAÇÃO E TESTE IMPLEMENTADO' as status;
