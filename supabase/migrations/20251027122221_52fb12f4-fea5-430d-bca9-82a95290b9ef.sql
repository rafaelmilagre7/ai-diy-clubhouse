-- Migration: Simplificar políticas RLS para learning system
-- Objetivo: Permitir acesso de usuários não-admin baseado em course_access_control

-- =====================================================
-- 1. REMOVER POLÍTICAS ANTIGAS COMPLEXAS
-- =====================================================

DROP POLICY IF EXISTS "secure_learning_lessons_access" ON learning_lessons;
DROP POLICY IF EXISTS "secure_learning_videos_access" ON learning_lesson_videos;
DROP POLICY IF EXISTS "learning_modules_access" ON learning_modules;

-- =====================================================
-- 2. GARANTIR FUNÇÃO can_access_learning_content
-- =====================================================

CREATE OR REPLACE FUNCTION public.can_access_learning_content(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = target_user_id
      AND (
        ur.name IN ('admin', 'membro_club', 'master_user', 'formacao', 'combo_viver_de_ia', 'hands_on')
        OR (ur.permissions->>'learning')::boolean = true
      )
  );
$$;

-- =====================================================
-- 3. NOVAS POLÍTICAS SIMPLIFICADAS - LEARNING_LESSONS
-- =====================================================

CREATE POLICY "learning_lessons_admin_full_access"
ON learning_lessons
FOR SELECT
TO authenticated
USING (
  public.is_user_admin_secure(auth.uid())
);

CREATE POLICY "learning_lessons_member_access"
ON learning_lessons
FOR SELECT
TO authenticated
USING (
  published = true
  AND (
    -- Acesso via course_access_control (role específico do curso)
    EXISTS (
      SELECT 1 
      FROM learning_modules lm
      JOIN course_access_control cac ON lm.course_id = cac.course_id
      JOIN profiles p ON p.role_id = cac.role_id
      WHERE lm.id = learning_lessons.module_id
        AND p.id = auth.uid()
    )
    OR
    -- Acesso via função global de conteúdo learning
    public.can_access_learning_content(auth.uid())
  )
);

-- =====================================================
-- 4. NOVAS POLÍTICAS SIMPLIFICADAS - LEARNING_LESSON_VIDEOS
-- =====================================================

CREATE POLICY "learning_videos_admin_full_access"
ON learning_lesson_videos
FOR SELECT
TO authenticated
USING (
  public.is_user_admin_secure(auth.uid())
);

CREATE POLICY "learning_videos_member_access"
ON learning_lesson_videos
FOR SELECT
TO authenticated
USING (
  -- Usuário pode ver vídeos de aulas publicadas que ele tem acesso
  EXISTS (
    SELECT 1 
    FROM learning_lessons ll
    JOIN learning_modules lm ON ll.module_id = lm.id
    WHERE ll.id = learning_lesson_videos.lesson_id
      AND ll.published = true
      AND (
        -- Acesso via role específico do curso
        EXISTS (
          SELECT 1
          FROM course_access_control cac
          JOIN profiles p ON p.role_id = cac.role_id
          WHERE cac.course_id = lm.course_id
            AND p.id = auth.uid()
        )
        OR
        -- Acesso global via função
        public.can_access_learning_content(auth.uid())
      )
  )
);

-- =====================================================
-- 5. NOVAS POLÍTICAS SIMPLIFICADAS - LEARNING_MODULES
-- =====================================================

CREATE POLICY "learning_modules_admin_full_access"
ON learning_modules
FOR SELECT
TO authenticated
USING (
  public.is_user_admin_secure(auth.uid())
);

CREATE POLICY "learning_modules_member_access"
ON learning_modules
FOR SELECT
TO authenticated
USING (
  published = true
  AND (
    -- Acesso via course_access_control
    EXISTS (
      SELECT 1
      FROM course_access_control cac
      JOIN profiles p ON p.role_id = cac.role_id
      WHERE cac.course_id = learning_modules.course_id
        AND p.id = auth.uid()
    )
    OR
    -- Acesso global
    public.can_access_learning_content(auth.uid())
  )
);

-- =====================================================
-- 6. VERIFICAR TABELA COURSE_ACCESS_CONTROL
-- =====================================================

-- Garantir que a tabela course_access_control existe e tem RLS habilitado
ALTER TABLE IF EXISTS course_access_control ENABLE ROW LEVEL SECURITY;

-- Política para ver controle de acesso (todos autenticados podem ver)
DROP POLICY IF EXISTS "course_access_readable_by_authenticated" ON course_access_control;
CREATE POLICY "course_access_readable_by_authenticated"
ON course_access_control
FOR SELECT
TO authenticated
USING (true);

-- =====================================================
-- 7. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON POLICY "learning_lessons_admin_full_access" ON learning_lessons IS 
'Admins têm acesso completo a todas as aulas (publicadas ou não)';

COMMENT ON POLICY "learning_lessons_member_access" ON learning_lessons IS 
'Usuários autenticados veem aulas publicadas quando: 
1) Seu role está em course_access_control para o curso da aula, OU 
2) A função can_access_learning_content retorna true (acesso global ao learning)';

COMMENT ON POLICY "learning_videos_member_access" ON learning_lesson_videos IS 
'Usuários veem vídeos de aulas que atendem aos critérios de acesso (via role ou função global)';

COMMENT ON POLICY "learning_modules_member_access" ON learning_modules IS 
'Usuários veem módulos publicados quando têm acesso ao curso via role ou acesso global';