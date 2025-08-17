-- Corrigir vulnerabilidades de segurança no conteúdo educacional premium
-- Remover políticas inseguras e criar políticas mais restritivas

-- 1. LEARNING_COURSES: Corrigir acesso público não autorizado
DROP POLICY IF EXISTS "learning_courses_admin_management" ON learning_courses;
DROP POLICY IF EXISTS "learning_courses_authenticated_only" ON learning_courses;

-- Política segura para administradores
CREATE POLICY "learning_courses_admin_secure" ON learning_courses
FOR ALL TO authenticated
USING (
  is_user_admin_secure(auth.uid())
)
WITH CHECK (
  is_user_admin_secure(auth.uid())
);

-- Política segura para usuários autenticados - apenas cursos publicados com acesso adequado
CREATE POLICY "learning_courses_secure_access" ON learning_courses
FOR SELECT TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    -- Admin pode ver tudo
    is_user_admin_secure(auth.uid()) OR
    -- Criador do curso pode ver
    created_by = auth.uid() OR
    -- Usuários com acesso específico podem ver cursos publicados
    (published = true AND can_access_course_enhanced(auth.uid(), id))
  )
);

-- 2. LEARNING_MODULES: Corrigir acesso público não autorizado
DROP POLICY IF EXISTS "Admins podem gerenciar todos os módulos" ON learning_modules;
DROP POLICY IF EXISTS "Users can access modules of allowed courses" ON learning_modules;
DROP POLICY IF EXISTS "learning_modules_secure_access" ON learning_modules;

-- Política segura para administradores
CREATE POLICY "learning_modules_admin_secure" ON learning_modules
FOR ALL TO authenticated
USING (
  is_user_admin_secure(auth.uid())
)
WITH CHECK (
  is_user_admin_secure(auth.uid())
);

-- Política segura para usuários autenticados
CREATE POLICY "learning_modules_authenticated_secure" ON learning_modules
FOR SELECT TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    -- Admin pode ver tudo
    is_user_admin_secure(auth.uid()) OR
    -- Criador do curso pode ver os módulos
    EXISTS (
      SELECT 1 FROM learning_courses lc 
      WHERE lc.id = course_id AND lc.created_by = auth.uid()
    ) OR
    -- Usuário com acesso ao curso pode ver módulos publicados
    (published = true AND EXISTS (
      SELECT 1 FROM user_course_access uca 
      WHERE uca.course_id = learning_modules.course_id 
        AND uca.user_id = auth.uid() 
        AND uca.access_type = 'granted'
        AND (uca.expires_at IS NULL OR uca.expires_at > now())
    ))
  )
);

-- 3. LEARNING_LESSONS: Corrigir acesso público não autorizado
DROP POLICY IF EXISTS "Admins podem gerenciar todas as aulas" ON learning_lessons;
DROP POLICY IF EXISTS "Users can access lessons of allowed courses" ON learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_secure_access" ON learning_lessons;

-- Política segura para administradores
CREATE POLICY "learning_lessons_admin_secure" ON learning_lessons
FOR ALL TO authenticated
USING (
  is_user_admin_secure(auth.uid())
)
WITH CHECK (
  is_user_admin_secure(auth.uid())
);

-- Política segura para usuários autenticados
CREATE POLICY "learning_lessons_authenticated_secure" ON learning_lessons
FOR SELECT TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    -- Admin pode ver tudo
    is_user_admin_secure(auth.uid()) OR
    -- Criador do curso pode ver as lições
    EXISTS (
      SELECT 1 FROM learning_modules lm
      JOIN learning_courses lc ON lm.course_id = lc.id
      WHERE lm.id = learning_lessons.module_id AND lc.created_by = auth.uid()
    ) OR
    -- Usuário com acesso ao curso pode ver lições publicadas
    (published = true AND EXISTS (
      SELECT 1 FROM learning_modules lm
      JOIN user_course_access uca ON lm.course_id = uca.course_id
      WHERE lm.id = learning_lessons.module_id 
        AND uca.user_id = auth.uid() 
        AND uca.access_type = 'granted'
        AND (uca.expires_at IS NULL OR uca.expires_at > now())
    ))
  )
);

-- 4. LESSON_TAGS: Corrigir exposição pública das tags
DROP POLICY IF EXISTS "Todos podem visualizar tags ativas" ON lesson_tags;

-- Política segura para tags - apenas usuários autenticados
CREATE POLICY "lesson_tags_authenticated_only" ON lesson_tags
FOR SELECT TO authenticated
USING (
  auth.uid() IS NOT NULL AND is_active = true
);

-- Política para administradores gerenciarem tags
CREATE POLICY "lesson_tags_admin_secure" ON lesson_tags
FOR ALL TO authenticated
USING (
  is_user_admin_secure(auth.uid())
)
WITH CHECK (
  is_user_admin_secure(auth.uid())
);

-- 5. Garantir que learning_progress seja seguro também
-- Verificar se há política insegura existente
DROP POLICY IF EXISTS "Usuários podem ver e gerenciar seu próprio progresso" ON learning_progress;

-- Política segura para progresso de aprendizagem
CREATE POLICY "learning_progress_owner_secure" ON learning_progress
FOR ALL TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    is_user_admin_secure(auth.uid())
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    is_user_admin_secure(auth.uid())
  )
);

-- 6. Verificar learning_comments também
DROP POLICY IF EXISTS "Users can update own comments" ON learning_comments;
DROP POLICY IF EXISTS "Usuários podem editar seus próprios comentários" ON learning_comments;
DROP POLICY IF EXISTS "Usuários podem excluir seus próprios comentários" ON learning_comments;

-- Política consolidada segura para comentários
CREATE POLICY "learning_comments_owner_secure" ON learning_comments
FOR UPDATE TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    is_user_admin_secure(auth.uid())
  )
);

CREATE POLICY "learning_comments_delete_secure" ON learning_comments
FOR DELETE TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    is_user_admin_secure(auth.uid())
  )
);

-- Log de auditoria da correção de segurança
INSERT INTO audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_fix',
  'premium_content_protection',
  jsonb_build_object(
    'description', 'Corrigidas vulnerabilidades de acesso público ao conteúdo educacional premium',
    'tables_fixed', ARRAY['learning_courses', 'learning_modules', 'learning_lessons', 'lesson_tags', 'learning_progress', 'learning_comments'],
    'vulnerability_type', 'unauthorized_public_access',
    'fix_applied_at', now()
  ),
  'critical'
);