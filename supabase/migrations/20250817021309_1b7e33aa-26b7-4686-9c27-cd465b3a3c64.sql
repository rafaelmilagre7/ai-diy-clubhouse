-- ==========================================
-- ETAPA 1: ATUALIZAR POLÍTICAS RLS PARA USAR ROLE_ID
-- Migração preparatória para remover o campo 'role' legado
-- ==========================================

-- CORRIGIR AUDIT LOGS RLS PRIMEIRO (que está gerando erros)
DROP POLICY IF EXISTS "audit_logs_secure_insert" ON audit_logs;
CREATE POLICY "audit_logs_service_role_insert" ON audit_logs
FOR INSERT 
WITH CHECK (
  (auth.role() = 'service_role') OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- MIGRAR DADOS PRIMEIRO: role legado -> role_id
DO $$
DECLARE
    profile_record RECORD;
    default_role_id uuid;
    admin_role_id uuid;
    member_role_id uuid;
BEGIN
    -- Buscar IDs dos papéis padrão
    SELECT id INTO admin_role_id FROM user_roles WHERE name = 'admin' LIMIT 1;
    SELECT id INTO member_role_id FROM user_roles WHERE name IN ('member', 'membro', 'membro_club') LIMIT 1;
    
    -- Se não existir role membro, criar um
    IF member_role_id IS NULL THEN
        INSERT INTO user_roles (name, description, permissions) 
        VALUES ('member', 'Membro padrão', '{"basic": true}'::jsonb)
        RETURNING id INTO member_role_id;
    END IF;
    
    default_role_id := member_role_id;
    
    -- Migrar usuários que têm 'role' mas não têm 'role_id'
    FOR profile_record IN 
        SELECT id, role FROM profiles 
        WHERE role_id IS NULL AND role IS NOT NULL
    LOOP
        IF profile_record.role = 'admin' AND admin_role_id IS NOT NULL THEN
            UPDATE profiles SET role_id = admin_role_id WHERE id = profile_record.id;
        ELSE
            UPDATE profiles SET role_id = default_role_id WHERE id = profile_record.id;
        END IF;
    END LOOP;
    
    -- Usuários sem role_id e sem role recebem role padrão
    UPDATE profiles 
    SET role_id = default_role_id 
    WHERE role_id IS NULL;
END $$;

-- TORNAR ROLE_ID OBRIGATÓRIO
ALTER TABLE profiles ALTER COLUMN role_id SET NOT NULL;

-- CRIAR FUNÇÕES ATUALIZADAS
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(ur.name, 'member')
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_user_admin_secure(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = target_user_id 
    AND ur.name = 'admin'
  );
$$;

-- FUNÇÃO AUXILIAR PARA VERIFICAR SE USUÁRIO ATUAL É ADMIN
CREATE OR REPLACE FUNCTION public.is_current_user_admin_via_role_id()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  );
$$;

-- ATUALIZAR POLÍTICAS RLS DEPENDENTES DO CAMPO 'role'

-- 1. user_badges policies
DROP POLICY IF EXISTS "Administradores podem ver e gerenciar todas as conquistas" ON user_badges;
CREATE POLICY "Administradores podem ver e gerenciar todas as conquistas" ON user_badges
FOR ALL USING (is_current_user_admin_via_role_id() OR user_id = auth.uid());

-- 2. tools policies  
DROP POLICY IF EXISTS "Apenas administradores podem atualizar ferramentas" ON tools;
DROP POLICY IF EXISTS "Apenas administradores podem excluir ferramentas" ON tools;
CREATE POLICY "Apenas administradores podem atualizar ferramentas" ON tools
FOR UPDATE USING (is_current_user_admin_via_role_id());
CREATE POLICY "Apenas administradores podem excluir ferramentas" ON tools
FOR DELETE USING (is_current_user_admin_via_role_id());

-- 3. Storage policies (tool logos)
DROP POLICY IF EXISTS "Apenas administradores podem inserir logos de ferramentas" ON storage.objects;
DROP POLICY IF EXISTS "Apenas administradores podem atualizar logos de ferramentas" ON storage.objects; 
DROP POLICY IF EXISTS "Apenas administradores podem excluir logos de ferramentas" ON storage.objects;
DROP POLICY IF EXISTS "Administradores podem gerenciar vídeos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de arquivos pelo proprietário para lear" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de arquivos pelo proprietário para learning" ON storage.objects;

CREATE POLICY "Apenas administradores podem inserir logos de ferramentas" ON storage.objects
FOR INSERT WITH CHECK (
  (bucket_id = 'tool-logos' AND is_current_user_admin_via_role_id()) OR
  (bucket_id NOT IN ('tool-logos', 'learning-videos', 'learning-materials'))
);

CREATE POLICY "Apenas administradores podem atualizar logos de ferramentas" ON storage.objects
FOR UPDATE USING (
  (bucket_id = 'tool-logos' AND is_current_user_admin_via_role_id()) OR
  (bucket_id NOT IN ('tool-logos', 'learning-videos', 'learning-materials'))
);

CREATE POLICY "Apenas administradores podem excluir logos de ferramentas" ON storage.objects
FOR DELETE USING (
  (bucket_id = 'tool-logos' AND is_current_user_admin_via_role_id()) OR
  (bucket_id NOT IN ('tool-logos', 'learning-videos', 'learning-materials'))
);

-- 4. tool_comments policies
DROP POLICY IF EXISTS "Autor ou admin pode excluir comentários" ON tool_comments;
CREATE POLICY "Autor ou admin pode excluir comentários" ON tool_comments
FOR DELETE USING (
  user_id = auth.uid() OR is_current_user_admin_via_role_id()
);

-- 5. learning_lesson_nps policies
DROP POLICY IF EXISTS "Administradores podem ver todas as avaliações NPS" ON learning_lesson_nps;
CREATE POLICY "Administradores podem ver todas as avaliações NPS" ON learning_lesson_nps
FOR SELECT USING (
  user_id = auth.uid() OR is_current_user_admin_via_role_id()
);

-- 6. permission_definitions policies
DROP POLICY IF EXISTS "Only admins can manage permissions" ON permission_definitions;
CREATE POLICY "Only admins can manage permissions" ON permission_definitions
FOR ALL USING (is_current_user_admin_via_role_id());

-- 7. role_permissions policies
DROP POLICY IF EXISTS "Only admins can manage role permissions" ON role_permissions;
CREATE POLICY "Only admins can manage role permissions" ON role_permissions
FOR ALL USING (is_current_user_admin_via_role_id());

-- 8. security_audit_logs policies
DROP POLICY IF EXISTS "Only admins can view security audit logs" ON security_audit_logs;
CREATE POLICY "Only admins can view security audit logs" ON security_audit_logs
FOR SELECT USING (is_current_user_admin_via_role_id());

-- LOG DA MIGRAÇÃO
INSERT INTO audit_logs (
  user_id, event_type, action, details, severity
) VALUES (
  NULL, 'system_migration', 'rls_policies_updated_for_role_id',
  jsonb_build_object(
    'migration_step', 1,
    'updated_policies', ARRAY[
      'user_badges', 'tools', 'storage.objects', 'tool_comments', 
      'learning_lesson_nps', 'permission_definitions', 'role_permissions', 'security_audit_logs'
    ],
    'new_function', 'is_current_user_admin_via_role_id',
    'migration_phase', 'prepare_for_role_column_removal',
    'completed_at', now()
  ),
  'info'
) ON CONFLICT DO NOTHING;