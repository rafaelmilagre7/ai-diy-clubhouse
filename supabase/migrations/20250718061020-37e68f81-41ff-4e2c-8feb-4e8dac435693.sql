-- CORREÇÃO CRÍTICA DOS PROBLEMAS DE SINCRONIZAÇÃO
-- Primeiro removendo funções existentes para evitar conflitos de tipo

-- Remover funções existentes
DROP FUNCTION IF EXISTS public.get_user_profile_optimized(uuid);
DROP FUNCTION IF EXISTS public.get_cached_profile(uuid);

-- 1. Recriar função get_user_profile_optimized com tipos corretos
CREATE OR REPLACE FUNCTION public.get_user_profile_optimized(target_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  email text,
  name text,
  role_name character varying(50), -- Tipo correto conforme user_roles.name
  role_id uuid,
  permissions jsonb,
  onboarding_completed boolean,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.name,
    ur.name as role_name,
    p.role_id,
    COALESCE(ur.permissions, '{}'::jsonb) as permissions,
    p.onboarding_completed,
    p.created_at
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;
END;
$$;

-- 2. Recriar função get_cached_profile com tipos corretos
CREATE OR REPLACE FUNCTION public.get_cached_profile(target_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  email text,
  name text,
  role_name character varying(50), -- Tipo correto
  role_id uuid,
  permissions jsonb,
  onboarding_completed boolean,
  created_at timestamp with time zone,
  cached_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  cache_record RECORD;
  profile_record RECORD;
BEGIN
  -- Verificar cache válido (5 minutos)
  SELECT * INTO cache_record
  FROM public.profile_cache 
  WHERE user_id = target_user_id 
  AND cached_at > (now() - interval '5 minutes')
  LIMIT 1;
  
  IF cache_record.user_id IS NOT NULL THEN
    -- Retornar dados do cache
    RETURN QUERY
    SELECT 
      cache_record.user_id as id,
      cache_record.cached_data->>'email' as email,
      cache_record.cached_data->>'name' as name,
      (cache_record.cached_data->>'role_name')::character varying(50) as role_name,
      (cache_record.cached_data->>'role_id')::uuid as role_id,
      COALESCE((cache_record.cached_data->>'permissions')::jsonb, '{}'::jsonb) as permissions,
      COALESCE((cache_record.cached_data->>'onboarding_completed')::boolean, false) as onboarding_completed,
      (cache_record.cached_data->>'created_at')::timestamp with time zone as created_at,
      cache_record.cached_at;
  ELSE
    -- Buscar dados atualizados e atualizar cache
    SELECT * INTO profile_record FROM public.get_user_profile_optimized(target_user_id) LIMIT 1;
    
    IF profile_record.id IS NOT NULL THEN
      -- Atualizar cache
      INSERT INTO public.profile_cache (user_id, cached_data, cached_at)
      VALUES (
        target_user_id,
        jsonb_build_object(
          'email', profile_record.email,
          'name', profile_record.name,
          'role_name', profile_record.role_name,
          'role_id', profile_record.role_id,
          'permissions', profile_record.permissions,
          'onboarding_completed', profile_record.onboarding_completed,
          'created_at', profile_record.created_at
        ),
        now()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        cached_data = EXCLUDED.cached_data,
        cached_at = EXCLUDED.cached_at;
      
      -- Retornar dados atualizados
      RETURN QUERY
      SELECT 
        profile_record.id,
        profile_record.email,
        profile_record.name,
        profile_record.role_name,
        profile_record.role_id,
        profile_record.permissions,
        profile_record.onboarding_completed,
        profile_record.created_at,
        now() as cached_at;
    END IF;
  END IF;
END;
$$;

-- 3. Corrigir função current_user_is_admin sem referenciar auth.users diretamente
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    INNER JOIN public.profiles p ON p.role_id = ur.id
    WHERE ur.name = 'admin'
    AND p.id = auth.uid()
  );
$$;

-- 4. Trigger para invalidação automática de cache
CREATE OR REPLACE FUNCTION public.invalidate_profile_cache()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Invalidar cache do usuário modificado
  DELETE FROM public.profile_cache WHERE user_id = COALESCE(NEW.id, OLD.id);
  
  -- Log da invalidação (apenas se usuário autenticado)
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details
    ) VALUES (
      COALESCE(NEW.id, OLD.id),
      'cache_invalidation',
      'profile_updated',
      jsonb_build_object(
        'trigger', 'invalidate_profile_cache',
        'operation', TG_OP
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar triggers
DROP TRIGGER IF EXISTS trigger_invalidate_profile_cache ON public.profiles;
CREATE TRIGGER trigger_invalidate_profile_cache
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.invalidate_profile_cache();

DROP TRIGGER IF EXISTS trigger_invalidate_role_cache ON public.user_roles;
CREATE TRIGGER trigger_invalidate_role_cache
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.invalidate_profile_cache();

-- 5. Função para limpeza automática de cache expirado
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.profile_cache 
  WHERE cached_at < (now() - interval '10 minutes');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- 6. Função de validação de integridade
CREATE OR REPLACE FUNCTION public.validate_auth_integrity()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profiles_without_roles integer;
  orphaned_cache integer;
  result jsonb;
BEGIN
  -- Contar perfis sem roles
  SELECT COUNT(*) INTO profiles_without_roles
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE ur.id IS NULL;
  
  -- Contar cache órfão
  SELECT COUNT(*) INTO orphaned_cache
  FROM public.profile_cache pc
  LEFT JOIN public.profiles p ON pc.user_id = p.id
  WHERE p.id IS NULL;
  
  -- Limpar cache órfão
  DELETE FROM public.profile_cache 
  WHERE user_id NOT IN (SELECT id FROM public.profiles);
  
  result := jsonb_build_object(
    'profiles_without_roles', profiles_without_roles,
    'orphaned_cache_cleaned', orphaned_cache,
    'validation_time', now(),
    'status', CASE 
      WHEN profiles_without_roles = 0 THEN 'healthy'
      ELSE 'issues_found'
    END
  );
  
  RETURN result;
END;
$$;

-- Comentários explicativos
COMMENT ON FUNCTION public.get_user_profile_optimized(uuid) IS 'Função otimizada para buscar perfil do usuário com tipos corretos - corrige problemas de sincronização';
COMMENT ON FUNCTION public.get_cached_profile(uuid) IS 'Função de cache de perfil com sincronização automática - elimina loops de autenticação';
COMMENT ON FUNCTION public.current_user_is_admin() IS 'Verificação de admin sem referência direta a auth.users - evita permission denied';
COMMENT ON FUNCTION public.invalidate_profile_cache() IS 'Trigger para invalidação automática de cache quando dados são modificados';
COMMENT ON FUNCTION public.cleanup_expired_cache() IS 'Limpeza automática de cache expirado para manter performance';
COMMENT ON FUNCTION public.validate_auth_integrity() IS 'Validação de integridade do sistema de autenticação e limpeza de dados órfãos';