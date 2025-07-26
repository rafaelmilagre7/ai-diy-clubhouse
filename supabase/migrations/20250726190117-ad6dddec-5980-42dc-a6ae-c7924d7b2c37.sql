-- Adicionar índices para melhorar performance nas consultas mais frequentes

-- Índice para tabela progress (consultas do dashboard)
CREATE INDEX IF NOT EXISTS idx_progress_user_completed 
ON public.progress(user_id, is_completed) 
WHERE is_completed = true;

-- Índice para consultas de progresso por solução
CREATE INDEX IF NOT EXISTS idx_progress_solution_user 
ON public.progress(solution_id, user_id);

-- Índice para analytics por usuário e data
CREATE INDEX IF NOT EXISTS idx_analytics_user_date 
ON public.analytics(user_id, created_at DESC);

-- Índice para solution_certificates por usuário
CREATE INDEX IF NOT EXISTS idx_solution_certificates_user 
ON public.solution_certificates(user_id, issued_at DESC);

-- Índice para learning_progress por usuário e lesson
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_lesson 
ON public.learning_progress(user_id, lesson_id);

-- Índice para profiles por email (lookup frequente)
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON public.profiles(email) 
WHERE email IS NOT NULL;

-- Índice composto para solutions publicadas
CREATE INDEX IF NOT EXISTS idx_solutions_published_category 
ON public.solutions(published, category, created_at DESC) 
WHERE published = true;