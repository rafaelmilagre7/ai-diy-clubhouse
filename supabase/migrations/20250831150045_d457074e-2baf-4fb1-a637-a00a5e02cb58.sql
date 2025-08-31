-- Investigar e corrigir políticas RLS problemáticas que causam erro transacional

-- Primeiro, vamos verificar as políticas RLS atuais em learning_lesson_videos
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'learning_lesson_videos';

-- Verificar se há triggers problemáticos
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'learning_lesson_videos';

-- Corrigir políticas RLS para evitar conflitos transacionais
-- Remover políticas problemáticas e recriar com estrutura correta

DROP POLICY IF EXISTS "learning_lesson_videos_admin_manage" ON learning_lesson_videos;
DROP POLICY IF EXISTS "learning_lesson_videos_authenticated_select" ON learning_lesson_videos;

-- Política para SELECT - usuários podem ver vídeos de aulas que têm acesso
CREATE POLICY "learning_lesson_videos_select" ON learning_lesson_videos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM learning_lessons ll
    WHERE ll.id = learning_lesson_videos.lesson_id
    AND ll.published = true
  )
  OR 
  -- Admins podem ver todos os vídeos
  EXISTS (
    SELECT 1 FROM profiles p
    INNER JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Política para INSERT - apenas admins
CREATE POLICY "learning_lesson_videos_admin_insert" ON learning_lesson_videos
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    INNER JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Política para UPDATE - apenas admins
CREATE POLICY "learning_lesson_videos_admin_update" ON learning_lesson_videos
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles p
    INNER JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Política para DELETE - apenas admins
CREATE POLICY "learning_lesson_videos_admin_delete" ON learning_lesson_videos
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles p
    INNER JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Verificar outras tabelas relacionadas que podem ter políticas problemáticas
-- Corrigir learning_lessons se necessário
DROP POLICY IF EXISTS "learning_lessons_conflicting_policy" ON learning_lessons;

-- Política para SELECT em learning_lessons - mais eficiente
CREATE POLICY "learning_lessons_select_optimized" ON learning_lessons
FOR SELECT USING (
  published = true
  OR 
  EXISTS (
    SELECT 1 FROM profiles p
    INNER JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Log da correção
INSERT INTO audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'rls_policy_fix',
  'fix_transactional_conflicts',
  jsonb_build_object(
    'tables_affected', array['learning_lesson_videos', 'learning_lessons'],
    'issue', 'INSERT in read-only transaction error',
    'solution', 'Separated SELECT policies from INSERT/UPDATE/DELETE policies'
  ),
  'info'
);