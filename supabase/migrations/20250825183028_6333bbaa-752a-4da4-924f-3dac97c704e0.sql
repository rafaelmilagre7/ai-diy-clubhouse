-- Criar RPCs para analytics reais sem fallbacks mock

-- 1. RPC para taxa de conclusão por solução
CREATE OR REPLACE FUNCTION public.get_completion_rate_by_solution(time_range text DEFAULT 'all')
RETURNS TABLE(
  name text,
  completion numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  start_date timestamp with time zone;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado - apenas administradores';
  END IF;

  -- Determinar data de início baseado no time_range
  CASE time_range
    WHEN '7d' THEN start_date := now() - interval '7 days';
    WHEN '30d' THEN start_date := now() - interval '30 days';
    WHEN '90d' THEN start_date := now() - interval '90 days';
    ELSE start_date := '2024-01-01'::timestamp with time zone;
  END CASE;

  RETURN QUERY
  SELECT 
    CASE 
      WHEN length(s.title) > 25 THEN left(s.title, 25) || '...'
      ELSE s.title
    END as name,
    CASE 
      WHEN COUNT(p.id) = 0 THEN 0::numeric
      ELSE ROUND((COUNT(CASE WHEN p.is_completed = true THEN 1 END)::numeric / COUNT(p.id)::numeric) * 100, 0)
    END as completion
  FROM public.solutions s
  LEFT JOIN public.progress p ON s.id = p.solution_id 
    AND p.created_at >= start_date
  WHERE s.published = true
  GROUP BY s.id, s.title
  HAVING COUNT(p.id) > 0
  ORDER BY completion DESC
  LIMIT 8;
END;
$$;

-- 2. RPC para métricas de engajamento por período
CREATE OR REPLACE FUNCTION public.get_engagement_metrics_by_period(time_range text DEFAULT 'all')
RETURNS TABLE(
  name text,
  value bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  start_date timestamp with time zone;
  date_format text;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado - apenas administradores';
  END IF;

  -- Determinar data de início e formato baseado no time_range
  CASE time_range
    WHEN '7d' THEN 
      start_date := now() - interval '7 days';
      date_format := 'DD/MM';
    WHEN '30d' THEN 
      start_date := now() - interval '30 days';
      date_format := 'DD/MM';
    WHEN '90d' THEN 
      start_date := now() - interval '90 days';
      date_format := 'Mon';
    ELSE 
      start_date := '2024-01-01'::timestamp with time zone;
      date_format := 'Mon YYYY';
  END CASE;

  RETURN QUERY
  SELECT 
    to_char(a.created_at, date_format) as name,
    COUNT(*)::bigint as value
  FROM public.analytics a
  WHERE a.created_at >= start_date
  GROUP BY to_char(a.created_at, date_format), 
           date_trunc(
             CASE 
               WHEN time_range IN ('7d', '30d') THEN 'day'
               WHEN time_range = '90d' THEN 'week'
               ELSE 'month'
             END, a.created_at
           )
  ORDER BY date_trunc(
             CASE 
               WHEN time_range IN ('7d', '30d') THEN 'day'
               WHEN time_range = '90d' THEN 'week'
               ELSE 'month'
             END, a.created_at
           )
  LIMIT 20;
END;
$$;

-- 3. RPC para atividades recentes do sistema
CREATE OR REPLACE FUNCTION public.get_recent_system_activities(limit_count integer DEFAULT 10)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  event_type text,
  solution text,
  created_at timestamp with time zone,
  user_name text,
  user_email text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado - apenas administradores';
  END IF;

  RETURN QUERY
  SELECT 
    a.id,
    a.user_id,
    a.event_type,
    COALESCE(s.title, 'Sistema') as solution,
    a.created_at,
    COALESCE(p.name, 'Usuário') as user_name,
    public.mask_email(COALESCE(p.email, '')) as user_email
  FROM public.analytics a
  LEFT JOIN public.solutions s ON a.solution_id = s.id
  LEFT JOIN public.profiles p ON a.user_id = p.id
  ORDER BY a.created_at DESC
  LIMIT limit_count;
END;
$$;

-- 4. RPC unificada para analytics do dashboard
CREATE OR REPLACE FUNCTION public.get_unified_analytics_data(time_range text DEFAULT 'all')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  start_date timestamp with time zone;
  result jsonb;
  completion_data jsonb;
  engagement_data jsonb;
  activities_data jsonb;
  stats_data jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado - apenas administradores';
  END IF;

  -- Determinar data de início
  CASE time_range
    WHEN '7d' THEN start_date := now() - interval '7 days';
    WHEN '30d' THEN start_date := now() - interval '30 days';
    WHEN '90d' THEN start_date := now() - interval '90 days';
    ELSE start_date := '2024-01-01'::timestamp with time zone;
  END CASE;

  -- Buscar dados de conclusão
  SELECT jsonb_agg(
    jsonb_build_object('name', cr.name, 'completion', cr.completion)
  ) INTO completion_data
  FROM public.get_completion_rate_by_solution(time_range) cr;

  -- Buscar dados de engajamento
  SELECT jsonb_agg(
    jsonb_build_object('name', em.name, 'value', em.value)
  ) INTO engagement_data
  FROM public.get_engagement_metrics_by_period(time_range) em;

  -- Buscar atividades recentes
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', ra.id,
      'user_id', ra.user_id,
      'event_type', ra.event_type,
      'solution', ra.solution,
      'created_at', ra.created_at,
      'user_name', ra.user_name,
      'user_email', ra.user_email
    )
  ) INTO activities_data
  FROM public.get_recent_system_activities(10) ra;

  -- Buscar estatísticas gerais (usando RPC existente)
  SELECT public.get_admin_analytics_overview() INTO stats_data;

  -- Construir resultado unificado
  result := jsonb_build_object(
    'completion_rate_data', COALESCE(completion_data, '[]'::jsonb),
    'engagement_data', COALESCE(engagement_data, '[]'::jsonb),
    'recent_activities', COALESCE(activities_data, '[]'::jsonb),
    'stats', COALESCE(stats_data, '{}'::jsonb),
    'generated_at', now(),
    'time_range', time_range
  );

  RETURN result;
END;
$$;