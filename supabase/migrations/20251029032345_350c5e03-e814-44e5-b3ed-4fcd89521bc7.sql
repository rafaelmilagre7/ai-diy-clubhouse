
-- =========================================================================
-- CORREÇÃO: Política RLS para vídeos de aulas
-- Problema: Apenas alguns roles específicos tinham acesso aos vídeos
-- Solução: Permitir que QUALQUER usuário autenticado veja vídeos de aulas publicadas
-- =========================================================================

-- 1. Remover política antiga restritiva
DROP POLICY IF EXISTS "learning_videos_member_access" ON learning_lesson_videos;

-- 2. Criar nova política: usuários autenticados podem ver vídeos de aulas publicadas
CREATE POLICY "authenticated_users_can_view_published_lesson_videos" 
ON learning_lesson_videos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM learning_lessons ll
    WHERE ll.id = learning_lesson_videos.lesson_id
    AND ll.published = true
  )
);

-- 3. Admins podem ver TODOS os vídeos (incluindo de aulas não publicadas)
CREATE POLICY "admins_can_view_all_lesson_videos" 
ON learning_lesson_videos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    INNER JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid()
    AND ur.name = 'admin'
  )
);

-- 4. Comentário explicativo
COMMENT ON POLICY "authenticated_users_can_view_published_lesson_videos" ON learning_lesson_videos IS 
'Permite que qualquer usuário autenticado visualize vídeos de aulas que estão publicadas';

COMMENT ON POLICY "admins_can_view_all_lesson_videos" ON learning_lesson_videos IS 
'Administradores podem visualizar todos os vídeos, incluindo de aulas não publicadas';
