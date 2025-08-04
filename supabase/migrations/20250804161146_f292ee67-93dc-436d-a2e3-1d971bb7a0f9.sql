-- Correção crítica de segurança: Proteger acesso aos analytics administrativos
-- Como views não suportam RLS, vamos criar função segura e remover a view insegura

-- 1. Remover a view insegura
DROP VIEW IF EXISTS public.admin_analytics_overview;

-- 2. Criar função segura que só admins podem acessar
CREATE OR REPLACE FUNCTION public.get_admin_analytics_overview_secure()
RETURNS TABLE(
  total_users bigint,
  active_users_24h bigint,
  new_users_30d bigint,
  total_solutions bigint,
  completed_implementations bigint,
  completion_rate numeric,
  avg_implementation_time_hours numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem ver analytics';
  END IF;

  -- Calcular e retornar analytics de forma segura
  RETURN QUERY
  SELECT 
    -- Total de usuários
    (SELECT COUNT(*)::bigint FROM public.profiles)::bigint as total_users,
    
    -- Usuários ativos nas últimas 24h (baseado em audit_logs)
    (SELECT COUNT(DISTINCT user_id)::bigint 
     FROM public.audit_logs 
     WHERE timestamp > NOW() - INTERVAL '24 hours'
     AND user_id IS NOT NULL)::bigint as active_users_24h,
    
    -- Novos usuários nos últimos 30 dias
    (SELECT COUNT(*)::bigint 
     FROM public.profiles 
     WHERE created_at > NOW() - INTERVAL '30 days')::bigint as new_users_30d,
    
    -- Total de soluções (se tabela solutions existir)
    COALESCE((SELECT COUNT(*)::bigint FROM public.solutions), 0::bigint) as total_solutions,
    
    -- Implementações completadas (baseado em checkpoints ou requests)
    COALESCE((SELECT COUNT(*)::bigint 
              FROM public.implementation_requests 
              WHERE status = 'completed'), 0::bigint) as completed_implementations,
    
    -- Taxa de conclusão
    CASE 
      WHEN (SELECT COUNT(*) FROM public.implementation_requests) > 0 THEN
        ROUND(
          (SELECT COUNT(*)::numeric FROM public.implementation_requests WHERE status = 'completed') / 
          (SELECT COUNT(*)::numeric FROM public.implementation_requests) * 100, 
          2
        )
      ELSE 0::numeric
    END as completion_rate,
    
    -- Tempo médio de implementação em horas
    COALESCE((SELECT AVG(EXTRACT(EPOCH FROM (processed_at - created_at))/3600)::numeric 
              FROM public.implementation_requests 
              WHERE status = 'completed' 
              AND processed_at IS NOT NULL), 0::numeric) as avg_implementation_time_hours;
END;
$$;

-- 3. Log da correção de segurança
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_fix',
  'admin_analytics_view_secured',
  jsonb_build_object(
    'action', 'Removed insecure admin_analytics_overview view',
    'replacement', 'Created secure function get_admin_analytics_overview_secure()',
    'security_improvement', 'Added admin role verification',
    'timestamp', now()
  ),
  'high'
);