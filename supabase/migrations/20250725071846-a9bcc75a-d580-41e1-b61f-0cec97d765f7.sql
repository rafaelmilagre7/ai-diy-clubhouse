-- Corrigir mais funções em lote para acelerar o processo

-- Funções de perfil e cache
CREATE OR REPLACE FUNCTION public.get_user_profile_optimized_secure(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_data jsonb;
  role_data jsonb;
BEGIN
  -- Log para debug
  RAISE NOTICE '[PROFILE_OPTIMIZED] Buscando perfil para: %', target_user_id;
  
  -- Buscar dados do perfil (SEM campos de onboarding)
  SELECT jsonb_build_object(
    'id', p.id,
    'email', p.email,
    'name', p.name,
    'company_name', p.company_name,
    'role_id', p.role_id,
    'role', p.role,
    'created_at', p.created_at,
    'updated_at', p.updated_at
  ) INTO profile_data
  FROM public.profiles p
  WHERE p.id = target_user_id;
  
  -- Se não encontrou perfil, retornar null
  IF profile_data IS NULL THEN
    RAISE NOTICE '[PROFILE_OPTIMIZED] Perfil não encontrado para: %', target_user_id;
    RETURN NULL;
  END IF;
  
  -- Buscar dados do role
  SELECT jsonb_build_object(
    'id', ur.id,
    'name', ur.name,
    'description', ur.description,
    'permissions', ur.permissions
  ) INTO role_data
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;
  
  -- Adicionar role_data ao perfil
  IF role_data IS NOT NULL THEN
    profile_data := profile_data || jsonb_build_object('user_roles', role_data);
    RAISE NOTICE '[PROFILE_OPTIMIZED] Role encontrado: %', role_data->>'name';
  ELSE
    profile_data := profile_data || jsonb_build_object('user_roles', null);
    RAISE NOTICE '[PROFILE_OPTIMIZED] Role não encontrado para: %', target_user_id;
  END IF;
  
  RAISE NOTICE '[PROFILE_OPTIMIZED] Retornando perfil completo para: %', profile_data->>'email';
  RETURN profile_data;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '[PROFILE_OPTIMIZED] ERRO: % para usuário %', SQLERRM, target_user_id;
    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.invalidate_profile_cache_secure(user_id uuid DEFAULT NULL::uuid)
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

-- Funções administrativas
CREATE OR REPLACE FUNCTION public.initialize_onboarding_for_all_users_secure()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_record record;
  created_count integer := 0;
  result jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado - Admin necessário');
  END IF;

  -- Criar registros iniciais para todos os usuários que não têm onboarding
  FOR user_record IN 
    SELECT p.id, p.email, p.name
    FROM public.profiles p
    WHERE NOT EXISTS (
      SELECT 1 FROM public.quick_onboarding qo WHERE qo.user_id = p.id
    )
  LOOP
    BEGIN
      INSERT INTO public.quick_onboarding (
        user_id,
        email,
        name,
        current_step,
        is_completed,
        created_at,
        updated_at
      ) VALUES (
        user_record.id,
        user_record.email,
        COALESCE(user_record.name, ''),
        1,
        false,
        now(),
        now()
      );
      
      created_count := created_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        -- Continuar mesmo se um usuário falhar
        CONTINUE;
    END;
  END LOOP;
  
  result := jsonb_build_object(
    'success', true,
    'message', format('Onboarding inicializado para %s usuários', created_count),
    'users_initialized', created_count
  );
  
  RETURN result;
END;
$$;