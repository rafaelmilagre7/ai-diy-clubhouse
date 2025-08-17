-- CORREÇÃO CRÍTICA: Políticas RLS para learning_lesson_videos
-- Remove políticas problemáticas e cria proteções adequadas

-- 1. Remover todas as políticas atuais (algumas são redundantes/conflitantes)
DROP POLICY IF EXISTS "Admins podem gerenciar todos os vídeos" ON learning_lesson_videos;
DROP POLICY IF EXISTS "Allow full access for admins" ON learning_lesson_videos;
DROP POLICY IF EXISTS "Allow read access for all authenticated users" ON learning_lesson_videos;
DROP POLICY IF EXISTS "Users can access videos of allowed lessons" ON learning_lesson_videos;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar vídeos" ON learning_lesson_videos;
DROP POLICY IF EXISTS "Usuários autenticados podem ver vídeos de aulas publicadas" ON learning_lesson_videos;
DROP POLICY IF EXISTS "learning_lesson_videos_access" ON learning_lesson_videos;

-- 2. Criar políticas seguras e específicas

-- APENAS ADMINS podem gerenciar (criar, editar, deletar) vídeos
CREATE POLICY "learning_lesson_videos_admin_manage" 
ON learning_lesson_videos 
FOR ALL 
USING (is_user_admin_secure(auth.uid()))
WITH CHECK (is_user_admin_secure(auth.uid()));

-- Usuários autenticados podem VER vídeos apenas de cursos que têm acesso
CREATE POLICY "learning_lesson_videos_user_read" 
ON learning_lesson_videos 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 
    FROM learning_lessons ll
    JOIN learning_modules lm ON ll.module_id = lm.id  
    JOIN learning_courses lc ON lm.course_id = lc.id
    WHERE ll.id = learning_lesson_videos.lesson_id
    AND (
      -- Curso publicado E usuário tem acesso por role
      (lc.published = true AND can_access_learning_content(auth.uid()))
      OR 
      -- Usuário tem acesso específico ao curso
      can_access_course_enhanced(auth.uid(), lc.id)
      OR
      -- Admin pode ver tudo
      is_user_admin_secure(auth.uid())
    )
  )
);

-- Log da correção de segurança
INSERT INTO audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_fix',
  'learning_lesson_videos_rls_hardening',
  jsonb_build_object(
    'issue', 'Removed overpermissive RLS allowing authenticated users to manage all videos',
    'solution', 'Restricted management to admins only, limited read access to authorized users',
    'tables_affected', '["learning_lesson_videos"]',
    'criticality', 'HIGH'
  ),
  'high'
);