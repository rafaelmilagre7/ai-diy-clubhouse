-- ==========================================
-- ETAPA 1: CORRIGIR PAPÉIS CONFUSOS - USAR APENAS ROLE_ID
-- Migração preparatória para fonte única da verdade
-- ==========================================

-- 1. CORRIGIR AUDIT LOGS RLS (que está gerando erros)
DROP POLICY IF EXISTS "audit_logs_secure_insert" ON audit_logs;
CREATE POLICY "audit_logs_service_role_insert" ON audit_logs
FOR INSERT 
WITH CHECK (
  (auth.role() = 'service_role') OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- 2. MIGRAR DADOS: role legado -> role_id
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

-- 3. TORNAR ROLE_ID OBRIGATÓRIO
ALTER TABLE profiles ALTER COLUMN role_id SET NOT NULL;

-- 4. REMOVER E RECRIAR FUNÇÕES COM NOMES CORRETOS
DROP FUNCTION IF EXISTS get_current_user_role();
DROP FUNCTION IF EXISTS is_user_admin_secure(uuid);

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

-- 5. FUNÇÃO AUXILIAR PARA USUÁRIO ATUAL
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

-- 6. ATUALIZAR POLÍTICAS RLS PROBLEMÁTICAS (apenas as que o erro mencionou)
-- user_badges
DROP POLICY IF EXISTS "Administradores podem ver e gerenciar todas as conquistas" ON user_badges;
CREATE POLICY "Administradores podem ver e gerenciar todas as conquistas" ON user_badges
FOR ALL USING (is_current_user_admin_via_role_id() OR user_id = auth.uid());

-- tools
DROP POLICY IF EXISTS "Apenas administradores podem atualizar ferramentas" ON tools;
DROP POLICY IF EXISTS "Apenas administradores podem excluir ferramentas" ON tools;
CREATE POLICY "Apenas administradores podem atualizar ferramentas" ON tools
FOR UPDATE USING (is_current_user_admin_via_role_id());
CREATE POLICY "Apenas administradores podem excluir ferramentas" ON tools
FOR DELETE USING (is_current_user_admin_via_role_id());

-- tool_comments
DROP POLICY IF EXISTS "Autor ou admin pode excluir comentários" ON tool_comments;
CREATE POLICY "Autor ou admin pode excluir comentários" ON tool_comments
FOR DELETE USING (
  user_id = auth.uid() OR is_current_user_admin_via_role_id()
);

-- 7. LOG DA MIGRAÇÃO
INSERT INTO audit_logs (
  user_id, event_type, action, details, severity
) VALUES (
  NULL, 'system_migration', 'role_system_step1_completed',
  jsonb_build_object(
    'migration_step', 1,
    'actions', ARRAY[
      'fixed_audit_logs_rls',
      'migrated_role_to_role_id',
      'made_role_id_required',
      'updated_admin_functions',
      'updated_core_rls_policies'
    ],
    'next_step', 'remove_role_column_and_remaining_policies',
    'completed_at', now()
  ),
  'info'
) ON CONFLICT DO NOTHING;