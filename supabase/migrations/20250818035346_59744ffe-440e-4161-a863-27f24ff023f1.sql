-- Atualizar política RLS para permitir visualização de todas as aulas publicadas (sistema freemium)
-- Usuários autenticados podem ver todas as aulas publicadas, controle de acesso é feito no frontend

DROP POLICY IF EXISTS "learning_lessons_course_role_access" ON public.learning_lessons;

-- Nova política: usuários autenticados podem ver todas as aulas publicadas
CREATE POLICY "learning_lessons_freemium_access" 
ON public.learning_lessons 
FOR SELECT 
USING (
  (published = true AND auth.uid() IS NOT NULL) OR 
  is_user_admin_secure(auth.uid()) OR
  (EXISTS (
    SELECT 1 
    FROM learning_modules lm
    JOIN learning_courses lc ON lm.course_id = lc.id
    WHERE lm.id = learning_lessons.module_id 
    AND lc.created_by = auth.uid()
  ))
);