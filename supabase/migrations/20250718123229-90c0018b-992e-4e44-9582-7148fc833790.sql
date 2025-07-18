
-- FASE 1: CORREÇÃO COMPLETA DA FUNÇÃO GET_CACHED_PROFILE
-- Remover função antiga e criar versão corrigida

DROP FUNCTION IF EXISTS public.get_cached_profile(uuid);
DROP FUNCTION IF EXISTS public.invalidate_profile_cache(uuid);

-- Criar função get_cached_profile que retorna dados estruturados corretamente
CREATE OR REPLACE FUNCTION public.get_cached_profile(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_data jsonb;
  user_role_data jsonb;
BEGIN
  -- Log para debug
  RAISE NOTICE '[CACHE] Buscando perfil para usuário: %', target_user_id;
  
  -- Buscar dados do perfil
  SELECT to_jsonb(p.*) INTO profile_data
  FROM public.profiles p
  WHERE p.id = target_user_id;
  
  -- Se não encontrou o perfil, retornar null
  IF profile_data IS NULL THEN
    RAISE NOTICE '[CACHE] Perfil não encontrado para: %', target_user_id;
    RETURN NULL;
  END IF;
  
  -- Buscar dados do role separadamente
  SELECT to_jsonb(ur.*) INTO user_role_data
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;
  
  -- Se encontrou role, adicionar ao perfil
  IF user_role_data IS NOT NULL THEN
    profile_data := profile_data || jsonb_build_object('user_roles', user_role_data);
    RAISE NOTICE '[CACHE] Role encontrado: %', user_role_data->>'name';
  ELSE
    RAISE NOTICE '[CACHE] Role não encontrado para usuário: %', target_user_id;
    profile_data := profile_data || jsonb_build_object('user_roles', null);
  END IF;
  
  -- Log final
  RAISE NOTICE '[CACHE] Perfil completo retornado: nome=%, role=%', 
    profile_data->>'name', 
    profile_data->'user_roles'->>'name';
  
  RETURN profile_data;
END;
$$;

-- Criar função para invalidar cache
CREATE OR REPLACE FUNCTION public.invalidate_profile_cache(user_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Esta função registra a invalidação no log
  IF user_id IS NOT NULL THEN
    RAISE NOTICE '[CACHE] Cache invalidado para usuário: %', user_id;
    
    -- Inserir log de invalidação se a tabela existir
    BEGIN
      INSERT INTO public.audit_logs (
        user_id,
        event_type,
        action,
        details
      ) VALUES (
        user_id,
        'cache_invalidation',
        'profile_cache_cleared',
        jsonb_build_object(
          'timestamp', now(),
          'reason', 'manual_invalidation'
        )
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- Ignorar se tabela não existir
        NULL;
    END;
  ELSE
    RAISE NOTICE '[CACHE] Cache global invalidado';
  END IF;
END;
$$;

-- Testar a função para garantir que funciona
DO $$
DECLARE
  test_result jsonb;
  test_user_id uuid;
BEGIN
  -- Pegar um usuário existente para teste
  SELECT id INTO test_user_id FROM public.profiles LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    SELECT public.get_cached_profile(test_user_id) INTO test_result;
    RAISE NOTICE '[TEST] Resultado do teste: %', test_result;
    
    -- Verificar se tem a estrutura esperada
    IF test_result IS NOT NULL AND test_result ? 'user_roles' THEN
      RAISE NOTICE '[TEST] ✅ Função funcionando corretamente!';
    ELSE
      RAISE WARNING '[TEST] ❌ Função não retornou estrutura esperada';
    END IF;
  ELSE
    RAISE NOTICE '[TEST] Nenhum usuário encontrado para teste';
  END IF;
END;
$$;
