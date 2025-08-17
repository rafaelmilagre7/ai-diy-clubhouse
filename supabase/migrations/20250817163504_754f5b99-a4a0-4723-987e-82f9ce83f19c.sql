-- Ajustar acesso de módulos e aulas para roles (membro_club, formacao, etc.) usando função can_access_course_enhanced
-- Não alterar função existente para evitar erro de retorno diferente

-- Política extra para módulos: permite SELECT quando o usuário tem acesso ao curso por role
CREATE POLICY IF NOT EXISTS "learning_modules_role_access"
ON public.learning_modules
FOR SELECT
TO authenticated
USING (
  (published = true)
  AND public.can_access_course_enhanced(auth.uid(), course_id)
);

-- Política extra para aulas: permite SELECT quando o usuário tem acesso ao curso por role
CREATE POLICY IF NOT EXISTS "learning_lessons_role_access"
ON public.learning_lessons
FOR SELECT
TO authenticated
USING (
  (published = true)
  AND public.can_access_course_enhanced(
    auth.uid(),
    (SELECT lm.course_id FROM public.learning_modules lm WHERE lm.id = learning_lessons.module_id)
  )
);
