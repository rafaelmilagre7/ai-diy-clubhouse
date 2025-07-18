
-- Corrigir a função get_cached_profile para retornar dados estruturados com user_roles
CREATE OR REPLACE FUNCTION public.get_cached_profile(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_data jsonb;
BEGIN
  -- Buscar perfil com user_roles em uma única query
  SELECT to_jsonb(p.*) || jsonb_build_object(
    'user_roles', to_jsonb(ur.*)
  ) INTO profile_data
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;
  
  -- Se não encontrou o perfil, retornar null
  IF profile_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Log para debug
  RAISE NOTICE '[CACHE] Perfil encontrado para %: role_id=%, user_roles=%', 
    target_user_id, 
    profile_data->>'role_id', 
    profile_data->'user_roles'->>'name';
  
  RETURN profile_data;
END;
$$;

-- Criar função para limpar cache quando necessário
CREATE OR REPLACE FUNCTION public.invalidate_profile_cache(user_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Esta função pode ser expandida no futuro para invalidar cache real
  -- Por enquanto, apenas registra no log
  IF user_id IS NOT NULL THEN
    RAISE NOTICE '[CACHE] Cache invalidado para usuário: %', user_id;
  ELSE
    RAISE NOTICE '[CACHE] Cache global invalidado';
  END IF;
END;
$$;

-- Garantir que a função existe e funciona corretamente
SELECT public.get_cached_profile('dc418224-acd7-4f5f-9a7e-e1c981b78fb6'::uuid) as test_result;
