-- Primeiro, verificar se existe tabela learning_lesson_nps
-- Se não existir, criar ela
CREATE TABLE IF NOT EXISTS public.learning_lesson_nps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_lesson_nps ENABLE ROW LEVEL SECURITY;

-- Policies básicas
CREATE POLICY IF NOT EXISTS "Users can view their own NPS responses" 
ON public.learning_lesson_nps 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own NPS responses" 
ON public.learning_lesson_nps 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Admins can view all NPS responses" 
ON public.learning_lesson_nps 
FOR ALL 
USING (is_user_admin_secure(auth.uid()));

-- Criar índices para performance se não existirem
CREATE INDEX IF NOT EXISTS idx_learning_lesson_nps_user_id ON public.learning_lesson_nps(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_lesson_nps_lesson_id ON public.learning_lesson_nps(lesson_id);
CREATE INDEX IF NOT EXISTS idx_learning_lesson_nps_created_at ON public.learning_lesson_nps(created_at);

-- Criar view NPS analytics
CREATE OR REPLACE VIEW public.nps_analytics_view AS
SELECT 
  nps.id,
  nps.lesson_id,
  nps.user_id,
  nps.score,
  nps.feedback,
  nps.created_at,
  nps.updated_at,
  COALESCE(p.name, p.email, 'Usuário') as user_name,
  COALESCE(p.email, 'sem-email') as user_email,
  COALESCE(l.title, 'Aula sem título') as lesson_title,
  COALESCE(m.title, 'Módulo sem título') as module_title,
  COALESCE(c.title, 'Curso sem título') as course_title,
  COALESCE(c.id::text, '') as course_id
FROM public.learning_lesson_nps nps
LEFT JOIN public.profiles p ON nps.user_id = p.id
LEFT JOIN public.learning_lessons l ON nps.lesson_id = l.id
LEFT JOIN public.learning_modules m ON l.module_id = m.id
LEFT JOIN public.learning_courses c ON m.course_id = c.id
ORDER BY nps.created_at DESC;