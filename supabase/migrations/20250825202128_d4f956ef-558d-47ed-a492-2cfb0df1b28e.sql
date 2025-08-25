-- RPC para calcular tempo médio de implementação
CREATE OR REPLACE FUNCTION public.get_average_implementation_time()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  avg_time numeric;
BEGIN
  -- Calcular tempo médio entre created_at e updated_at de implementações concluídas
  SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400.0) INTO avg_time
  FROM public.progress
  WHERE status = 'completed' 
    AND updated_at > created_at
    AND created_at >= NOW() - INTERVAL '90 days';
  
  -- Se não houver dados, calcular baseado em implementation_requests processadas
  IF avg_time IS NULL THEN
    SELECT AVG(EXTRACT(EPOCH FROM (processed_at - created_at)) / 86400.0) INTO avg_time
    FROM public.implementation_requests
    WHERE status = 'completed'
      AND processed_at IS NOT NULL
      AND created_at >= NOW() - INTERVAL '90 days';
  END IF;
  
  RETURN COALESCE(avg_time, 0);
END;
$function$;

-- RPC para métricas de engajamento de usuários
CREATE OR REPLACE FUNCTION public.get_user_engagement_metrics(time_range text DEFAULT '30_days')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  days_interval integer;
  daily_active numeric;
  weekly_active numeric;
  monthly_active numeric;
  avg_session_time numeric;
  bounce_rate numeric;
BEGIN
  -- Determinar intervalo baseado no time_range
  CASE time_range
    WHEN '7_days' THEN days_interval := 7;
    WHEN '30_days' THEN days_interval := 30;
    WHEN '90_days' THEN days_interval := 90;
    ELSE days_interval := 30;
  END CASE;
  
  -- Usuários ativos diários (média no período)
  SELECT AVG(daily_count) INTO daily_active
  FROM (
    SELECT DATE(created_at) as date, COUNT(DISTINCT user_id) as daily_count
    FROM public.analytics
    WHERE created_at >= NOW() - INTERVAL '1 day' * days_interval
    GROUP BY DATE(created_at)
  ) daily_stats;
  
  -- Usuários ativos semanais
  SELECT COUNT(DISTINCT user_id) INTO weekly_active
  FROM public.analytics
  WHERE created_at >= NOW() - INTERVAL '7 days';
  
  -- Usuários ativos mensais
  SELECT COUNT(DISTINCT user_id) INTO monthly_active
  FROM public.analytics
  WHERE created_at >= NOW() - INTERVAL '30 days';
  
  -- Tempo médio de sessão (estimativa baseada em eventos consecutivos)
  SELECT AVG(session_duration) INTO avg_session_time
  FROM (
    SELECT 
      user_id,
      EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / 60.0 as session_duration
    FROM public.analytics
    WHERE created_at >= NOW() - INTERVAL '1 day' * days_interval
    GROUP BY user_id, DATE(created_at)
    HAVING COUNT(*) > 1
  ) sessions;
  
  -- Taxa de rejeição (usuários com apenas 1 evento)
  WITH single_event_users AS (
    SELECT user_id, COUNT(*) as event_count
    FROM public.analytics
    WHERE created_at >= NOW() - INTERVAL '1 day' * days_interval
    GROUP BY user_id
    HAVING COUNT(*) = 1
  ),
  total_users AS (
    SELECT COUNT(DISTINCT user_id) as total
    FROM public.analytics
    WHERE created_at >= NOW() - INTERVAL '1 day' * days_interval
  )
  SELECT 
    CASE 
      WHEN tu.total > 0 THEN (seu.single_count::numeric / tu.total::numeric) * 100
      ELSE 0
    END INTO bounce_rate
  FROM (SELECT COUNT(*) as single_count FROM single_event_users) seu
  CROSS JOIN total_users tu;
  
  result := jsonb_build_object(
    'daily_active_users', COALESCE(daily_active, 0),
    'weekly_active_users', COALESCE(weekly_active, 0),
    'monthly_active_users', COALESCE(monthly_active, 0),
    'avg_session_time_minutes', COALESCE(avg_session_time, 0),
    'bounce_rate_percentage', COALESCE(bounce_rate, 0),
    'generated_at', NOW(),
    'time_range', time_range
  );
  
  RETURN result;
END;
$function$;

-- RPC para trends históricos de usuários
CREATE OR REPLACE FUNCTION public.get_user_growth_trends(time_range text DEFAULT '30_days')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  days_interval integer;
  growth_data jsonb;
  retention_data jsonb;
BEGIN
  -- Determinar intervalo
  CASE time_range
    WHEN '7_days' THEN days_interval := 7;
    WHEN '30_days' THEN days_interval := 30;
    WHEN '90_days' THEN days_interval := 90;
    ELSE days_interval := 30;
  END CASE;
  
  -- Dados de crescimento de usuários
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', date,
      'new_users', new_users,
      'total_users', SUM(new_users) OVER (ORDER BY date)
    )
  ) INTO growth_data
  FROM (
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as new_users
    FROM public.profiles
    WHERE created_at >= NOW() - INTERVAL '1 day' * days_interval
    GROUP BY DATE(created_at)
    ORDER BY date
  ) daily_growth;
  
  -- Dados de retenção por coorte
  WITH user_cohorts AS (
    SELECT 
      user_id,
      DATE_TRUNC('week', created_at) as cohort_week
    FROM public.profiles
    WHERE created_at >= NOW() - INTERVAL '1 day' * days_interval
  ),
  user_activity AS (
    SELECT 
      a.user_id,
      uc.cohort_week,
      DATE_TRUNC('week', a.created_at) as activity_week
    FROM public.analytics a
    JOIN user_cohorts uc ON a.user_id = uc.user_id
    WHERE a.created_at >= NOW() - INTERVAL '1 day' * days_interval
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'cohort_week', cohort_week,
      'retention_week_1', retention_1,
      'retention_week_2', retention_2,
      'retention_week_4', retention_4
    )
  ) INTO retention_data
  FROM (
    SELECT 
      cohort_week,
      COUNT(DISTINCT CASE WHEN activity_week = cohort_week + INTERVAL '1 week' THEN user_id END)::numeric / 
        COUNT(DISTINCT user_id)::numeric * 100 as retention_1,
      COUNT(DISTINCT CASE WHEN activity_week = cohort_week + INTERVAL '2 weeks' THEN user_id END)::numeric / 
        COUNT(DISTINCT user_id)::numeric * 100 as retention_2,
      COUNT(DISTINCT CASE WHEN activity_week = cohort_week + INTERVAL '4 weeks' THEN user_id END)::numeric / 
        COUNT(DISTINCT user_id)::numeric * 100 as retention_4
    FROM user_activity
    GROUP BY cohort_week
    ORDER BY cohort_week
  ) retention_stats;
  
  result := jsonb_build_object(
    'growth_data', COALESCE(growth_data, '[]'::jsonb),
    'retention_data', COALESCE(retention_data, '[]'::jsonb),
    'generated_at', NOW(),
    'time_range', time_range
  );
  
  RETURN result;
END;
$function$;

-- RPC para analytics de jornada do usuário
CREATE OR REPLACE FUNCTION public.get_user_journey_analytics(time_range text DEFAULT '30_days')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  days_interval integer;
  funnel_data jsonb;
  conversion_rates jsonb;
BEGIN
  -- Determinar intervalo
  CASE time_range
    WHEN '7_days' THEN days_interval := 7;
    WHEN '30_days' THEN days_interval := 30;
    WHEN '90_days' THEN days_interval := 90;
    ELSE days_interval := 30;
  END CASE;
  
  -- Dados do funil de conversão
  WITH funnel_stats AS (
    SELECT 
      COUNT(DISTINCT p.id) as total_users,
      COUNT(DISTINCT CASE WHEN p.onboarding_completed THEN p.id END) as completed_onboarding,
      COUNT(DISTINCT pr.user_id) as started_solution,
      COUNT(DISTINCT CASE WHEN pr.status = 'completed' THEN pr.user_id END) as completed_solution,
      COUNT(DISTINCT ir.user_id) as requested_implementation
    FROM public.profiles p
    LEFT JOIN public.progress pr ON p.id = pr.user_id 
      AND pr.created_at >= NOW() - INTERVAL '1 day' * days_interval
    LEFT JOIN public.implementation_requests ir ON p.id = ir.user_id 
      AND ir.created_at >= NOW() - INTERVAL '1 day' * days_interval
    WHERE p.created_at >= NOW() - INTERVAL '1 day' * days_interval
  )
  SELECT jsonb_build_object(
    'total_users', total_users,
    'completed_onboarding', completed_onboarding,
    'started_solution', started_solution,
    'completed_solution', completed_solution,
    'requested_implementation', requested_implementation
  ) INTO funnel_data
  FROM funnel_stats;
  
  -- Taxas de conversão por etapa
  WITH conversion_stats AS (
    SELECT 
      (funnel_data->>'completed_onboarding')::numeric / 
        NULLIF((funnel_data->>'total_users')::numeric, 0) * 100 as onboarding_rate,
      (funnel_data->>'started_solution')::numeric / 
        NULLIF((funnel_data->>'completed_onboarding')::numeric, 0) * 100 as solution_start_rate,
      (funnel_data->>'completed_solution')::numeric / 
        NULLIF((funnel_data->>'started_solution')::numeric, 0) * 100 as solution_completion_rate,
      (funnel_data->>'requested_implementation')::numeric / 
        NULLIF((funnel_data->>'completed_solution')::numeric, 0) * 100 as implementation_request_rate
  )
  SELECT jsonb_build_object(
    'onboarding_conversion', COALESCE(onboarding_rate, 0),
    'solution_start_conversion', COALESCE(solution_start_rate, 0),
    'solution_completion_conversion', COALESCE(solution_completion_rate, 0),
    'implementation_request_conversion', COALESCE(implementation_request_rate, 0)
  ) INTO conversion_rates
  FROM conversion_stats;
  
  result := jsonb_build_object(
    'funnel_data', funnel_data,
    'conversion_rates', conversion_rates,
    'generated_at', NOW(),
    'time_range', time_range
  );
  
  RETURN result;
END;
$function$;