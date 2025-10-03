-- Função para buscar dados de evolução de NPS
CREATE OR REPLACE FUNCTION public.get_nps_evolution_data(
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  monthly_evolution jsonb;
  course_nps jsonb;
  course_evolution jsonb;
BEGIN
  -- Evolução mensal geral
  WITH monthly_data AS (
    SELECT 
      date_trunc('month', lnps.created_at) as month,
      COUNT(*) as total_responses,
      COUNT(*) FILTER (WHERE lnps.score >= 9) as promoters,
      COUNT(*) FILTER (WHERE lnps.score >= 7 AND lnps.score < 9) as neutrals,
      COUNT(*) FILTER (WHERE lnps.score < 7) as detractors,
      AVG(lnps.score) as avg_score
    FROM learning_lesson_nps lnps
    WHERE (p_start_date IS NULL OR lnps.created_at >= p_start_date)
      AND (p_end_date IS NULL OR lnps.created_at <= p_end_date)
    GROUP BY date_trunc('month', lnps.created_at)
    ORDER BY month
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'month', month,
      'nps_score', ROUND((
        (promoters::numeric - detractors::numeric) / NULLIF(total_responses, 0) * 100
      )::numeric, 1),
      'total_responses', total_responses,
      'promoters', promoters,
      'neutrals', neutrals,
      'detractors', detractors,
      'avg_score', ROUND(avg_score::numeric, 2)
    )
  ) INTO monthly_evolution
  FROM monthly_data;
  
  -- NPS por curso (agregado)
  WITH course_data AS (
    SELECT 
      lc.id as course_id,
      lc.title as course_title,
      COUNT(*) as total_responses,
      COUNT(*) FILTER (WHERE lnps.score >= 9) as promoters,
      COUNT(*) FILTER (WHERE lnps.score >= 7 AND lnps.score < 9) as neutrals,
      COUNT(*) FILTER (WHERE lnps.score < 7) as detractors,
      AVG(lnps.score) as avg_score
    FROM learning_lesson_nps lnps
    INNER JOIN learning_lessons ll ON lnps.lesson_id = ll.id
    INNER JOIN learning_modules lm ON ll.module_id = lm.id
    INNER JOIN learning_courses lc ON lm.course_id = lc.id
    WHERE (p_start_date IS NULL OR lnps.created_at >= p_start_date)
      AND (p_end_date IS NULL OR lnps.created_at <= p_end_date)
    GROUP BY lc.id, lc.title
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'course_id', course_id,
      'course_title', course_title,
      'nps_score', ROUND((
        (promoters::numeric - detractors::numeric) / NULLIF(total_responses, 0) * 100
      )::numeric, 1),
      'total_responses', total_responses,
      'promoters', promoters,
      'neutrals', neutrals,
      'detractors', detractors,
      'avg_score', ROUND(avg_score::numeric, 2)
    ) ORDER BY course_title
  ) INTO course_nps
  FROM course_data;
  
  -- Evolução mensal por curso
  WITH course_monthly_data AS (
    SELECT 
      lc.id as course_id,
      lc.title as course_title,
      date_trunc('month', lnps.created_at) as month,
      COUNT(*) as total_responses,
      COUNT(*) FILTER (WHERE lnps.score >= 9) as promoters,
      COUNT(*) FILTER (WHERE lnps.score >= 7 AND lnps.score < 9) as neutrals,
      COUNT(*) FILTER (WHERE lnps.score < 7) as detractors
    FROM learning_lesson_nps lnps
    INNER JOIN learning_lessons ll ON lnps.lesson_id = ll.id
    INNER JOIN learning_modules lm ON ll.module_id = lm.id
    INNER JOIN learning_courses lc ON lm.course_id = lc.id
    WHERE (p_start_date IS NULL OR lnps.created_at >= p_start_date)
      AND (p_end_date IS NULL OR lnps.created_at <= p_end_date)
    GROUP BY lc.id, lc.title, date_trunc('month', lnps.created_at)
    ORDER BY lc.title, month
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'course_id', course_id,
      'course_title', course_title,
      'month', month,
      'nps_score', ROUND((
        (promoters::numeric - detractors::numeric) / NULLIF(total_responses, 0) * 100
      )::numeric, 1),
      'total_responses', total_responses
    )
  ) INTO course_evolution
  FROM course_monthly_data;
  
  -- Montar resultado final
  result := jsonb_build_object(
    'monthly_evolution', COALESCE(monthly_evolution, '[]'::jsonb),
    'course_nps', COALESCE(course_nps, '[]'::jsonb),
    'course_evolution', COALESCE(course_evolution, '[]'::jsonb)
  );
  
  RETURN result;
END;
$$;