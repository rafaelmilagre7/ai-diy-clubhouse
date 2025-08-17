-- CORREÇÃO CRÍTICA: Remover acesso público às tabelas tools e learning_courses
-- Restringir acesso apenas a usuários autenticados e autorizados

-- 1. CORRIGIR TABELA TOOLS - Remover acesso público
DROP POLICY IF EXISTS "tools_public_active_only" ON tools;
DROP POLICY IF EXISTS "Users can view active tools for benefits" ON tools;

-- Nova política: Apenas usuários autenticados podem ver ferramentas
CREATE POLICY "tools_authenticated_users_only" 
ON tools 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND status = true
  AND (
    -- Usuários com acesso a benefícios (membro_club, formacao, admin)
    EXISTS (
      SELECT 1 
      FROM profiles p
      JOIN user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() 
      AND ur.name IN ('admin', 'membro_club', 'formacao')
    )
    OR
    -- Verificar se o usuário tem acesso específico via benefit_access_control
    EXISTS (
      SELECT 1
      FROM benefit_access_control bac
      JOIN profiles p ON p.role_id = bac.role_id
      WHERE p.id = auth.uid() 
      AND bac.tool_id = tools.id
    )
  )
);

-- 2. CORRIGIR LEARNING_COURSES - Remover acesso público  
DROP POLICY IF EXISTS "learning_courses_unified_access" ON learning_courses;

-- Nova política: Apenas usuários autenticados e autorizados
CREATE POLICY "learning_courses_authenticated_only" 
ON learning_courses 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    -- Admins podem ver tudo
    is_user_admin_secure(auth.uid())
    OR
    -- Cursos publicados para usuários com acesso a conteúdo de aprendizado
    (published = true AND can_access_learning_content(auth.uid()))
    OR
    -- Acesso específico ao curso via user_course_access
    can_access_course_enhanced(auth.uid(), id)
  )
);

-- 3. VERIFICAR E CORRIGIR learning_modules e learning_lessons se necessário
-- Primeiro verificar as políticas atuais
DO $$
DECLARE
  policy_count integer;
BEGIN
  -- Contar políticas públicas em learning_modules
  SELECT count(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename = 'learning_modules'
    AND 'public' = ANY(roles);
    
  IF policy_count > 0 THEN
    -- Log se encontrou políticas públicas
    INSERT INTO audit_logs (
      user_id, event_type, action, details, severity
    ) VALUES (
      auth.uid(), 'security_audit', 'public_policies_detected',
      jsonb_build_object('table', 'learning_modules', 'policy_count', policy_count),
      'high'
    );
  END IF;
END $$;

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
  'remove_public_access_tools_learning',
  jsonb_build_object(
    'issue', 'Removed public access to tools and learning content',
    'tables_affected', '["tools", "learning_courses"]',
    'policies_removed', '["tools_public_active_only", "learning_courses_unified_access"]',
    'new_restrictions', 'Access limited to authenticated users with appropriate roles',
    'criticality', 'CRITICAL'
  ),
  'critical'
);