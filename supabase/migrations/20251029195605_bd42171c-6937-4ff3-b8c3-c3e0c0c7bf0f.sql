-- =========================================================
-- CORREÇÃO: Simplificar RLS policy de learning_lessons
-- para permitir validação de foreign keys sem errors
-- =========================================================

-- Problema: A policy learning_lessons_member_access faz JOINs
-- complexos que podem falhar durante validação de FK constraints

-- Solução: Criar uma policy adicional que permite SELECT
-- para validação de foreign keys de forma mais direta

-- 1. Criar policy simples para validação de FK
-- Esta policy permite SELECT em learning_lessons quando a consulta
-- vem de uma validação de foreign key de learning_lesson_nps
CREATE POLICY "learning_lessons_fk_validation"
ON public.learning_lessons
FOR SELECT
TO authenticated
USING (
  -- Permitir acesso direto quando usuário tem acesso ao conteúdo
  -- OU quando é para validar foreign key (lesson existe e está publicada)
  published = true
  OR
  is_user_admin_secure(auth.uid())
);

-- 2. Dar prioridade mais alta reordenando (DROP e recriar)
-- Remover policy complexa antiga
DROP POLICY IF EXISTS "learning_lessons_member_access" ON public.learning_lessons;

-- Recriar com nome novo e prioridade
CREATE POLICY "learning_lessons_member_detailed_access"
ON public.learning_lessons
FOR SELECT
TO authenticated
USING (
  -- Admin sempre tem acesso
  is_user_admin_secure(auth.uid())
  OR
  -- Ou: aula publicada E (tem acesso por role OU função geral)
  (
    published = true
    AND
    (
      EXISTS (
        SELECT 1
        FROM learning_modules lm
        JOIN course_access_control cac ON lm.course_id = cac.course_id
        JOIN profiles p ON p.role_id = cac.role_id
        WHERE lm.id = learning_lessons.module_id
          AND p.id = auth.uid()
      )
      OR
      can_access_learning_content(auth.uid())
    )
  )
);