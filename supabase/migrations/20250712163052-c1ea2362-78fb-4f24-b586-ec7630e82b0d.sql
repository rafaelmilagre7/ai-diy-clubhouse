-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_learning_lesson_nps_user_id ON public.learning_lesson_nps(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_lesson_nps_lesson_id ON public.learning_lesson_nps(lesson_id);
CREATE INDEX IF NOT EXISTS idx_learning_lesson_nps_created_at ON public.learning_lesson_nps(created_at);

-- Criar view otimizada para analytics de NPS
CREATE OR REPLACE VIEW public.nps_analytics_view AS
SELECT 
  nps.id,
  nps.lesson_id,
  nps.user_id,
  nps.score,
  nps.feedback,
  nps.created_at,
  nps.updated_at,
  p.name as user_name,
  p.email as user_email,
  l.title as lesson_title,
  m.title as module_title,
  c.title as course_title,
  c.id as course_id
FROM public.learning_lesson_nps nps
JOIN public.profiles p ON nps.user_id = p.id
JOIN public.learning_lessons l ON nps.lesson_id = l.id
JOIN public.learning_modules m ON l.module_id = m.id
JOIN public.learning_courses c ON m.course_id = c.id
ORDER BY nps.created_at DESC;