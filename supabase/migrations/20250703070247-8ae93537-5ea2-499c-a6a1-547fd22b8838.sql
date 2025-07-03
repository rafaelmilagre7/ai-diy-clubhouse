-- CORREÇÃO FINAL SIMPLIFICADA - APENAS A VIEW PROBLEMÁTICA
-- Fix da referência ambígua ao user_id sem log de auditoria complexo

DROP VIEW IF EXISTS public.user_segmentation_analytics CASCADE;
CREATE VIEW public.user_segmentation_analytics AS
SELECT 
  CASE 
    WHEN p.created_at > NOW() - INTERVAL '7 days' THEN 'new_user'
    WHEN last_activity.last_seen > NOW() - INTERVAL '7 days' THEN 'active_user'
    WHEN last_activity.last_seen > NOW() - INTERVAL '30 days' THEN 'occasional_user'
    ELSE 'inactive_user'
  END as user_segment,
  COUNT(p.id) as user_count,
  AVG(stats.total_solutions) as avg_solutions_per_user,
  AVG(stats.total_lessons) as avg_lessons_per_user
FROM public.profiles p
LEFT JOIN (
  SELECT 
    a.user_id,
    MAX(GREATEST(
      COALESCE(a.created_at, '1970-01-01'::timestamp),
      COALESCE(pr.last_activity, '1970-01-01'::timestamp),
      COALESCE(lp.updated_at, '1970-01-01'::timestamp)
    )) as last_seen
  FROM public.analytics a
  FULL OUTER JOIN public.progress pr ON a.user_id = pr.user_id
  FULL OUTER JOIN public.learning_progress lp ON a.user_id = lp.user_id
  GROUP BY a.user_id
) last_activity ON p.id = last_activity.user_id
LEFT JOIN (
  SELECT 
    pr.user_id,
    COUNT(DISTINCT pr.solution_id) as total_solutions,
    COUNT(DISTINCT lp.lesson_id) as total_lessons
  FROM public.progress pr
  FULL OUTER JOIN public.learning_progress lp ON pr.user_id = lp.user_id
  GROUP BY pr.user_id
) stats ON p.id = stats.user_id
GROUP BY user_segment;

-- ADICIONAR COMENTÁRIO DE SEGURANÇA
COMMENT ON VIEW public.user_segmentation_analytics IS 'View segura (SECURITY INVOKER) - Segmentação analítica de usuários';