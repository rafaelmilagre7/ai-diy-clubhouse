
-- Funções avançadas para RLS Fase 3
-- Sistema completo de monitoramento e validação

-- Função principal de resumo de segurança RLS
CREATE OR REPLACE FUNCTION public.get_rls_security_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_tables INTEGER;
  protected_tables INTEGER;
  critical_tables INTEGER;
  rls_disabled_tables INTEGER;
  no_policies_tables INTEGER;
  security_percentage NUMERIC;
  status TEXT;
  result JSONB;
BEGIN
  -- Contar estatísticas de tabelas
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE rls_enabled = true AND has_policies = true) as protected,
    COUNT(*) FILTER (WHERE rls_enabled = false AND has_policies = false) as critical,
    COUNT(*) FILTER (WHERE rls_enabled = false AND has_policies = true) as rls_disabled,
    COUNT(*) FILTER (WHERE rls_enabled = true AND has_policies = false) as no_policies
  INTO total_tables, protected_tables, critical_tables, rls_disabled_tables, no_policies_tables
  FROM public.check_rls_status();
  
  -- Calcular porcentagem de segurança
  IF total_tables > 0 THEN
    security_percentage := ROUND((protected_tables::NUMERIC / total_tables::NUMERIC) * 100, 1);
  ELSE
    security_percentage := 0;
  END IF;
  
  -- Determinar status geral
  IF security_percentage = 100 THEN
    status := 'SECURE';
  ELSIF critical_tables > 0 THEN
    status := 'CRITICAL';
  ELSIF rls_disabled_tables > 0 OR no_policies_tables > 0 THEN
    status := 'WARNING';
  ELSE
    status := 'UNKNOWN';
  END IF;
  
  -- Construir resultado JSON
  result := jsonb_build_object(
    'total_tables', total_tables,
    'protected_tables', protected_tables,
    'critical_tables', critical_tables,
    'rls_disabled_tables', rls_disabled_tables,
    'no_policies_tables', no_policies_tables,
    'security_percentage', security_percentage,
    'status', status,
    'last_check', NOW()
  );
  
  RETURN result;
END;
$$;

-- Função para validação completa de segurança RLS
CREATE OR REPLACE FUNCTION public.validate_complete_rls_security()
RETURNS TABLE(
  table_name TEXT,
  rls_enabled BOOLEAN,
  has_policies BOOLEAN,
  policy_count BIGINT,
  security_status TEXT,
  risk_level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::TEXT,
    t.rls_enabled,
    t.has_policies,
    t.policy_count,
    t.security_status,
    CASE 
      WHEN t.security_status LIKE '✅%' THEN 'BAIXO'
      WHEN t.security_status LIKE '⚠️%' THEN 'ALTO'
      WHEN t.security_status LIKE '🔴%' THEN 'CRÍTICO'
      ELSE 'MÉDIO'
    END::TEXT as risk_level
  FROM public.check_rls_status() t
  ORDER BY 
    CASE 
      WHEN t.security_status LIKE '🔴%' THEN 1
      WHEN t.security_status LIKE '⚠️%' THEN 2
      ELSE 3
    END,
    t.table_name;
END;
$$;

-- Função para verificação de regressão RLS
CREATE OR REPLACE FUNCTION public.check_rls_regression()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_summary JSONB;
  critical_count INTEGER;
  regression_detected BOOLEAN := false;
BEGIN
  -- Obter resumo atual
  current_summary := public.get_rls_security_summary();
  critical_count := (current_summary->>'critical_tables')::INTEGER;
  
  -- Verificar se há regressão
  IF critical_count > 0 THEN
    regression_detected := true;
  END IF;
  
  -- Log da verificação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    auth.uid(),
    CASE 
      WHEN regression_detected THEN 'security_regression'
      ELSE 'security_check'
    END,
    'rls_regression_check',
    'security_system',
    jsonb_build_object(
      'timestamp', NOW(),
      'regression_detected', regression_detected,
      'critical_tables', critical_count,
      'security_summary', current_summary
    ),
    CASE 
      WHEN regression_detected THEN 'high'
      ELSE 'low'
    END
  );
  
  -- Se detectou regressão, criar alerta adicional
  IF regression_detected THEN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      resource_id,
      details,
      severity
    ) VALUES (
      auth.uid(),
      'security_violation',
      'rls_regression_detected',
      'security_system',
      jsonb_build_object(
        'timestamp', NOW(),
        'critical_tables_count', critical_count,
        'alert_level', 'HIGH',
        'message', 'Regressão de segurança RLS detectada - ação imediata necessária'
      ),
      'high'
    );
  END IF;
END;
$$;

-- Função para registrar violação de tentativa RLS
CREATE OR REPLACE FUNCTION public.log_rls_violation_attempt(
  p_table_name TEXT,
  p_operation TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'security_violation',
    'rls_violation_attempt',
    p_user_id::TEXT,
    jsonb_build_object(
      'table_name', p_table_name,
      'operation', p_operation,
      'attempted_user_id', p_user_id,
      'timestamp', NOW(),
      'blocked_by_rls', true
    ),
    'high'
  );
END;
$$;

-- Função melhorada para logs de acesso seguro
CREATE OR REPLACE FUNCTION public.log_security_access(
  p_table_name TEXT,
  p_operation TEXT,
  p_resource_id TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir log apenas se usuário autenticado
  IF auth.uid() IS NOT NULL THEN
    BEGIN
      INSERT INTO public.audit_logs (
        user_id,
        event_type,
        action,
        resource_id,
        details,
        severity
      ) VALUES (
        auth.uid(),
        'data_access',
        p_operation,
        p_resource_id,
        jsonb_build_object(
          'table_name', p_table_name,
          'operation', p_operation,
          'timestamp', NOW(),
          'rls_protected', true
        ),
        'low'
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- Falhar silenciosamente para não interromper operações
        NULL;
    END;
  END IF;
END;
$$;

-- Comentários de documentação
COMMENT ON FUNCTION public.get_rls_security_summary() IS 
'Função principal para obter resumo completo de segurança RLS - Fase 3';

COMMENT ON FUNCTION public.validate_complete_rls_security() IS 
'Validação detalhada de todas as tabelas com classificação de risco';

COMMENT ON FUNCTION public.check_rls_regression() IS 
'Verificação automática de regressão de segurança RLS';

COMMENT ON FUNCTION public.log_rls_violation_attempt(TEXT, TEXT, UUID) IS 
'Registra tentativas de violação de políticas RLS';
