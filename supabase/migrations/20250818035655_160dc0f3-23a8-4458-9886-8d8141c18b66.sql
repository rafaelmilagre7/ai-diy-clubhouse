-- Atualizar política RLS dos módulos para sistema freemium
-- Usuários autenticados podem ver todos os módulos publicados, controle de acesso é feito no frontend

DROP POLICY IF EXISTS "learning_modules_course_role_access" ON public.learning_modules;

-- Nova política: usuários autenticados podem ver todos os módulos publicados
CREATE POLICY "learning_modules_freemium_access" 
ON public.learning_modules 
FOR SELECT 
USING (
  (published = true AND auth.uid() IS NOT NULL) OR 
  is_user_admin_secure(auth.uid()) OR
  (EXISTS (
    SELECT 1 
    FROM learning_courses lc
    WHERE lc.id = learning_modules.course_id
    AND lc.created_by = auth.uid()
  ))
);