
-- Migration de limpeza completa para resolver problemas de cache das funções de roles
-- Esta migration força a recriação de todas as funções relacionadas

-- 1. Dropar todas as funções existentes para forçar limpeza do cache
DROP FUNCTION IF EXISTS public.validate_profile_roles() CASCADE;
DROP FUNCTION IF EXISTS public.audit_role_assignments() CASCADE;
DROP FUNCTION IF EXISTS public.sync_profile_roles() CASCADE;
DROP FUNCTION IF EXISTS public.is_user_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- 2. Recriar função para validar inconsistências nos roles dos usuários
CREATE OR REPLACE FUNCTION public.validate_profile_roles()
RETURNS TABLE(
  user_id uuid,
  email text,
  user_role text,
  user_role_id uuid,
  expected_role_name text,
  expected_role_id uuid,
  issue_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    p.role as user_role,
    p.role_id as user_role_id,
    COALESCE(ur.name, 'ROLE_NOT_FOUND') as expected_role_name,
    p.role_id as expected_role_id,
    CASE 
      WHEN p.role IS NULL AND p.role_id IS NULL THEN 'both_null'
      WHEN p.role IS NOT NULL AND p.role_id IS NULL THEN 'missing_role_id'
      WHEN p.role IS NULL AND p.role_id IS NOT NULL THEN 'missing_role'
      WHEN p.role IS NOT NULL AND p.role_id IS NOT NULL AND ur.id IS NULL THEN 'invalid_role_id'
      WHEN p.role IS NOT NULL AND p.role_id IS NOT NULL AND ur.id IS NOT NULL AND p.role != ur.name THEN 'role_mismatch'
      ELSE 'unknown'
    END as issue_type
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE 
    -- Casos problemáticos
    (p.role IS NULL AND p.role_id IS NULL) OR
    (p.role IS NOT NULL AND p.role_id IS NULL) OR
    (p.role IS NULL AND p.role_id IS NOT NULL) OR
    (p.role_id IS NOT NULL AND ur.id IS NULL) OR
    (p.role IS NOT NULL AND p.role_id IS NOT NULL AND ur.id IS NOT NULL AND p.role != ur.name)
  ORDER BY p.created_at DESC;
END;
$$;

-- 3. Recriar função para auditoria geral do sistema de roles
CREATE OR REPLACE FUNCTION public.audit_role_assignments()
RETURNS TABLE(
  user_count_by_role jsonb,
  inconsistencies_count bigint,
  total_users bigint,
  roles_without_users text[],
  users_without_roles bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  role_counts jsonb;
  inconsistencies_cnt bigint;
  total_users_cnt bigint;
  unused_roles text[];
  users_no_roles bigint;
BEGIN
  -- Contar usuários por role
  SELECT jsonb_object_agg(
    COALESCE(ur.name, 'sem_role'), 
    role_count
  ) INTO role_counts
  FROM (
    SELECT 
      ur.name,
      COUNT(p.id) as role_count
    FROM public.user_roles ur
    LEFT JOIN public.profiles p ON p.role_id = ur.id
    GROUP BY ur.name
    UNION ALL
    SELECT 
      'sem_role' as name,
      COUNT(p.id) as role_count
    FROM public.profiles p
    WHERE p.role_id IS NULL
  ) role_summary;
  
  -- Contar inconsistências
  SELECT COUNT(*) INTO inconsistencies_cnt
  FROM public.validate_profile_roles();
  
  -- Contar total de usuários
  SELECT COUNT(*) INTO total_users_cnt FROM public.profiles;
  
  -- Encontrar roles sem usuários
  SELECT ARRAY_AGG(ur.name) INTO unused_roles
  FROM public.user_roles ur
  LEFT JOIN public.profiles p ON p.role_id = ur.id
  WHERE p.id IS NULL;
  
  -- Contar usuários sem roles
  SELECT COUNT(*) INTO users_no_roles
  FROM public.profiles
  WHERE role_id IS NULL;
  
  RETURN QUERY SELECT 
    role_counts,
    inconsistencies_cnt,
    total_users_cnt,
    unused_roles,
    users_no_roles;
END;
$$;

-- 4. Recriar função para sincronizar roles automaticamente
CREATE OR REPLACE FUNCTION public.sync_profile_roles()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  corrected_count integer := 0;
  total_profiles integer := 0;
  default_role_id uuid;
  result_message text;
BEGIN
  -- Obter role padrão 'member'
  SELECT id INTO default_role_id 
  FROM public.user_roles 
  WHERE name = 'membro_club' OR name = 'member'
  LIMIT 1;
  
  -- Se não existir role padrão, criar uma
  IF default_role_id IS NULL THEN
    INSERT INTO public.user_roles (name, description, permissions)
    VALUES ('member', 'Membro padrão', '{"read": true}'::jsonb)
    RETURNING id INTO default_role_id;
  END IF;
  
  -- Contar total de perfis
  SELECT COUNT(*) INTO total_profiles FROM public.profiles;
  
  -- Corrigir perfis sem role_id
  UPDATE public.profiles 
  SET role_id = default_role_id
  WHERE role_id IS NULL;
  
  GET DIAGNOSTICS corrected_count = ROW_COUNT;
  
  -- Preparar mensagem de resultado
  IF corrected_count > 0 THEN
    result_message := format('Sincronização concluída: %s perfis corrigidos de %s total', 
                           corrected_count, total_profiles);
  ELSE
    result_message := format('Nenhuma correção necessária. Todos os %s perfis estão sincronizados', 
                           total_profiles);
  END IF;
  
  -- Registrar no log de auditoria
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details
  ) VALUES (
    auth.uid(),
    'system_maintenance',
    'role_sync',
    jsonb_build_object(
      'corrected_profiles', corrected_count,
      'total_profiles', total_profiles,
      'default_role_used', default_role_id,
      'sync_timestamp', NOW()
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'total_profiles', total_profiles,
    'profiles_corrected', corrected_count,
    'message', result_message
  );
END;
$$;

-- 5. Recriar função para verificar se um usuário é admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id AND ur.name = 'admin'
  );
END;
$$;

-- 6. Recriar função global is_admin() que usa o usuário atual
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.is_user_admin(auth.uid());
END;
$$;

-- 7. Comentário final de validação
COMMENT ON FUNCTION public.validate_profile_roles() IS 'Função recriada em migration de limpeza para resolver cache';
COMMENT ON FUNCTION public.audit_role_assignments() IS 'Função recriada em migration de limpeza para resolver cache';
COMMENT ON FUNCTION public.sync_profile_roles() IS 'Função recriada em migration de limpeza para resolver cache';
