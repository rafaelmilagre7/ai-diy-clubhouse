-- Corrigir a última SECURITY DEFINER view restante (com DROP da função)

-- Fazer DROP das funções existentes
DROP VIEW IF EXISTS nps_analytics_view;
DROP FUNCTION IF EXISTS get_nps_analytics();

CREATE OR REPLACE FUNCTION get_nps_analytics()
RETURNS TABLE(
  total_responses bigint,
  average_score numeric,
  nps_score numeric,
  promoters_count bigint,
  passives_count bigint,
  detractors_count bigint,
  response_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado - apenas administradores';
  END IF;

  RETURN QUERY
  WITH nps_data AS (
    SELECT 
      COUNT(*)::bigint as total,
      AVG(score)::numeric as avg_score,
      COUNT(CASE WHEN score >= 9 THEN 1 END)::bigint as promoters,
      COUNT(CASE WHEN score >= 7 AND score <= 8 THEN 1 END)::bigint as passives,
      COUNT(CASE WHEN score <= 6 THEN 1 END)::bigint as detractors
    FROM public.learning_lesson_nps
    WHERE created_at > NOW() - INTERVAL '30 days'
  ),
  lesson_stats AS (
    SELECT COUNT(DISTINCT user_id)::bigint as active_users
    FROM public.progress
    WHERE created_at > NOW() - INTERVAL '30 days'
  )
  SELECT 
    nd.total,
    ROUND(nd.avg_score, 2),
    CASE 
      WHEN nd.total > 0 THEN 
        ROUND(((nd.promoters::numeric - nd.detractors::numeric) / nd.total::numeric) * 100, 2)
      ELSE 0
    END as nps,
    nd.promoters,
    nd.passives,
    nd.detractors,
    CASE 
      WHEN ls.active_users > 0 THEN 
        ROUND((nd.total::numeric / ls.active_users::numeric) * 100, 2)
      ELSE 0
    END as rate
  FROM nps_data nd, lesson_stats ls;
END;
$$;