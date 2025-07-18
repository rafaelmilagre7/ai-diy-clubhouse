-- FASE 5: Robustez de Permissões - Limpeza e Otimização de RLS Policies

-- 1. Corrigir function search paths (resolvendo warns do linter)
-- Atualizar principais funções para ter search_path seguro

CREATE OR REPLACE FUNCTION public.is_user_admin_secure(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Fonte única de verdade: apenas verificar user_roles
  RETURN EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = COALESCE(user_id, auth.uid()) 
    AND ur.name = 'admin'
  );
END;
$$;

-- 2. Simplificar verificações de permissões - função consolidada
CREATE OR REPLACE FUNCTION public.user_has_role(role_name text, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = COALESCE(user_id, auth.uid()) 
    AND ur.name = role_name
  );
END;
$$;

-- 3. Função para obter role do usuário (cache-friendly)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  role_name text;
BEGIN
  SELECT ur.name INTO role_name
  FROM profiles p
  JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = COALESCE(user_id, auth.uid())
  LIMIT 1;
  
  RETURN COALESCE(role_name, 'none');
END;
$$;

-- 4. Remover funções obsoletas que causam confusão
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_admin_user();

-- 5. Otimizar policies mais críticas usando as novas funções

-- Atualizar policy de profiles para ser mais performática
DROP POLICY IF EXISTS "profiles_authenticated_select" ON public.profiles;
DROP POLICY IF EXISTS "secure_profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_authenticated_only" ON public.profiles;

CREATE POLICY "profiles_unified_access" ON public.profiles
FOR ALL
USING (
  -- Usuário pode ver seu próprio perfil
  id = auth.uid() OR
  -- Admin pode ver todos os perfis
  public.user_has_role('admin')
)
WITH CHECK (
  -- Usuário pode atualizar seu próprio perfil
  id = auth.uid() OR
  -- Admin pode atualizar qualquer perfil
  public.user_has_role('admin')
);

-- 6. Simplificar policies de tools
DROP POLICY IF EXISTS "tools_authenticated_select" ON public.tools;
DROP POLICY IF EXISTS "block_incomplete_onboarding_tools" ON public.tools;

CREATE POLICY "tools_simplified_access" ON public.tools
FOR SELECT
USING (
  -- Tools ativos são visíveis para usuários autenticados
  status = true AND auth.uid() IS NOT NULL
);

-- 7. Atualizar policy de forum_topics
DROP POLICY IF EXISTS "forum_topics_secure_select_policy" ON public.forum_topics;

CREATE POLICY "forum_topics_auth_access" ON public.forum_topics
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 8. Atualizar policy de forum_categories
DROP POLICY IF EXISTS "forum_categories_secure_select_policy" ON public.forum_categories;

CREATE POLICY "forum_categories_active_access" ON public.forum_categories
FOR SELECT
USING (is_active = true AND auth.uid() IS NOT NULL);

-- 9. Simplificar policy de events
DROP POLICY IF EXISTS "events_secure_select_policy" ON public.events;

CREATE POLICY "events_auth_access" ON public.events
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 10. Criar policy de logging para violações de segurança
CREATE OR REPLACE FUNCTION public.log_security_violation(
  violation_type text,
  resource_table text,
  attempted_action text,
  user_context jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'security_violation',
    attempted_action,
    resource_table,
    jsonb_build_object(
      'violation_type', violation_type,
      'table', resource_table,
      'user_context', user_context,
      'timestamp', NOW(),
      'session_info', jsonb_build_object(
        'role', public.get_user_role(),
        'user_id', auth.uid()
      )
    ),
    'high'
  );
END;
$$;

-- 11. Adicionar índices para melhorar performance das verificações de role
CREATE INDEX IF NOT EXISTS idx_profiles_role_id_user_id ON public.profiles(role_id, id);
CREATE INDEX IF NOT EXISTS idx_user_roles_name ON public.user_roles(name);

-- 12. Trigger para invalidar cache quando role muda
CREATE OR REPLACE FUNCTION public.invalidate_role_cache()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Log da mudança de role
  INSERT INTO audit_logs (
    user_id,
    event_type,
    action,
    details
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    'role_change',
    TG_OP,
    jsonb_build_object(
      'old_role_id', OLD.role_id,
      'new_role_id', NEW.role_id,
      'changed_by', auth.uid(),
      'timestamp', NOW()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar trigger apenas se não existir
DROP TRIGGER IF EXISTS role_change_audit ON public.profiles;
CREATE TRIGGER role_change_audit
  AFTER UPDATE OF role_id ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.invalidate_role_cache();