-- Adicionar políticas extras para acesso baseado em roles para módulos e aulas

-- Política para módulos: acesso baseado em roles do curso
CREATE POLICY "learning_modules_course_role_access"
ON public.learning_modules
FOR SELECT
TO authenticated
USING (
  (published = true)
  AND public.can_access_course_enhanced(auth.uid(), course_id)
);

-- Política para aulas: acesso baseado em roles do curso  
CREATE POLICY "learning_lessons_course_role_access"
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