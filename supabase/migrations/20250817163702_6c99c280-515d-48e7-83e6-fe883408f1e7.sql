-- Corrigir política de cursos que estava impedindo acesso aos membros_club
-- A política atual está muito restritiva

-- Remover política problemática
DROP POLICY IF EXISTS "learning_courses_secure_access" ON public.learning_courses;

-- Criar nova política que permite acesso baseado em:
-- 1. Admin pode ver tudo
-- 2. Criador pode ver seus próprios cursos
-- 3. Cursos publicados podem ser vistos por quem tem role adequado

CREATE POLICY "learning_courses_enhanced_access"
ON public.learning_courses
FOR SELECT
TO authenticated
USING (
  -- Admins podem ver tudo
  is_user_admin_secure(auth.uid())
  OR
  -- Criadores podem ver seus próprios cursos
  (created_by = auth.uid())
  OR
  -- Cursos publicados: se não tem restrição, qualquer um autenticado pode ver
  (
    published = true 
    AND NOT EXISTS (
      SELECT 1 FROM course_access_control cac 
      WHERE cac.course_id = id
    )
  )
  OR
  -- Cursos publicados com restrição: apenas quem tem role adequado
  (
    published = true 
    AND EXISTS (
      SELECT 1 FROM course_access_control cac 
      JOIN profiles p ON p.id = auth.uid()
      WHERE cac.course_id = id 
      AND cac.role_id = p.role_id
    )
  )
);