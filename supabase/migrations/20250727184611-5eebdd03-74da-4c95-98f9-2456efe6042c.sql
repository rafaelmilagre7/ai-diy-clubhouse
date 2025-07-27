-- Criar view simplificada para analytics de NPS
CREATE OR REPLACE VIEW public.nps_analytics_view AS
SELECT 
  nps.id,
  nps.user_id,
  nps.lesson_id,
  nps.score,
  nps.feedback,
  nps.created_at,
  nps.updated_at,
  p.name as user_name,
  p.email as user_email,
  ll.title as lesson_title,
  ll.description as lesson_description,
  lm.title as module_title,
  lc.title as course_title,
  -- Classificação NPS
  CASE 
    WHEN nps.score >= 9 THEN 'promoter'
    WHEN nps.score >= 7 THEN 'neutral' 
    ELSE 'detractor'
  END as nps_category
FROM public.learning_lesson_nps nps
LEFT JOIN public.profiles p ON nps.user_id = p.id
LEFT JOIN public.learning_lessons ll ON nps.lesson_id = ll.id
LEFT JOIN public.learning_modules lm ON ll.module_id = lm.id
LEFT JOIN public.learning_courses lc ON lm.course_id = lc.id;