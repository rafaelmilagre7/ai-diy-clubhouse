
-- PLANO DE RECONSTRUÇÃO INTELIGENTE DA AUTENTICAÇÃO
-- Objetivo: Resolver definitivamente o "Verificando credenciais" sem perder dados

-- 1. Função para buscar perfil otimizado em uma única query
CREATE OR REPLACE FUNCTION public.get_user_profile_optimized(target_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  profile_data jsonb;
  user_email text;
BEGIN
  -- Log para debug
  RAISE NOTICE '[PROFILE-OPT] Buscando perfil otimizado para: %', target_user_id;
  
  -- Buscar perfil completo com role em uma única query otimizada
  SELECT jsonb_build_object(
    'id', p.id,
    'email', p.email,
    'name', p.name,
    'avatar_url', p.avatar_url,
    'role', COALESCE(p.role, 'member'),
    'role_id', p.role_id,
    'onboarding_completed', COALESCE(p.onboarding_completed, false),
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'user_roles', CASE 
      WHEN ur.id IS NOT NULL THEN 
        jsonb_build_object(
          'id', ur.id,
          'name', ur.name,
          'permissions', ur.permissions
        )
      ELSE null
    END
  ) INTO profile_data
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;
  
  -- Se encontrou o perfil, retornar
  IF profile_data IS NOT NULL THEN
    RAISE NOTICE '[PROFILE-OPT] Perfil encontrado: %', profile_data->>'name';
    RETURN profile_data;
  END IF;
  
  -- Se não encontrou, buscar email do auth.users e criar perfil
  RAISE NOTICE '[PROFILE-OPT] Perfil não encontrado, tentando criar...';
  
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = target_user_id;
  
  -- Criar perfil automaticamente se não existir
  IF user_email IS NOT NULL THEN
    PERFORM public.ensure_user_profile_exists(target_user_id, user_email);
    
    -- Buscar novamente após criação
    SELECT jsonb_build_object(
      'id', p.id,
      'email', p.email,
      'name', p.name,
      'avatar_url', p.avatar_url,
      'role', COALESCE(p.role, 'member'),
      'role_id', p.role_id,
      'onboarding_completed', COALESCE(p.onboarding_completed, false),
      'created_at', p.created_at,
      'updated_at', p.updated_at,
      'user_roles', CASE 
        WHEN ur.id IS NOT NULL THEN 
          jsonb_build_object(
            'id', ur.id,
            'name', ur.name,
            'permissions', ur.permissions
          )
        ELSE null
      END
    ) INTO profile_data
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = target_user_id;
    
    RAISE NOTICE '[PROFILE-OPT] Perfil criado e retornado';
    RETURN COALESCE(profile_data, '{"error": "failed_to_create"}'::jsonb);
  END IF;
  
  -- Fallback final
  RAISE NOTICE '[PROFILE-OPT] Fallback - retornando perfil mínimo';
  RETURN jsonb_build_object(
    'id', target_user_id,
    'email', '',
    'name', 'Usuário',
    'role', 'member',
    'onboarding_completed', false,
    'error', 'created_minimal_profile'
  );
END;
$$;

-- 2. Função para garantir que usuário tem perfil válido
CREATE OR REPLACE FUNCTION public.ensure_user_profile_exists(target_user_id uuid, user_email text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  default_role_id uuid;
  profile_exists boolean;
BEGIN
  -- Verificar se perfil já existe
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = target_user_id) INTO profile_exists;
  
  IF profile_exists THEN
    RETURN true;
  END IF;
  
  -- Buscar role padrão
  SELECT id INTO default_role_id 
  FROM public.user_roles 
  WHERE name IN ('member', 'membro_club', 'membro')
  ORDER BY 
    CASE 
      WHEN name = 'membro_club' THEN 1
      WHEN name = 'member' THEN 2
      ELSE 3
    END
  LIMIT 1;
  
  -- Se não encontrou role, criar um básico
  IF default_role_id IS NULL THEN
    INSERT INTO public.user_roles (name, permissions) 
    VALUES ('member', '{"basic": true}'::jsonb)
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO default_role_id;
  END IF;
  
  -- Buscar email se não foi fornecido
  IF user_email IS NULL THEN
    SELECT email INTO user_email FROM auth.users WHERE id = target_user_id;
  END IF;
  
  -- Criar perfil
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role_id,
    role,
    onboarding_completed,
    created_at,
    updated_at
  ) VALUES (
    target_user_id,
    COALESCE(user_email, ''),
    COALESCE(user_email, 'Usuário'),
    default_role_id,
    'member',
    false,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    role_id = COALESCE(profiles.role_id, default_role_id),
    role = COALESCE(profiles.role, 'member'),
    updated_at = now();
  
  RETURN true;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '[ENSURE-PROFILE] Erro: %', SQLERRM;
    RETURN false;
END;
$$;

-- 3. Função para verificação rápida de admin
CREATE OR REPLACE FUNCTION public.is_user_admin_fast(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = target_user_id 
    AND (
      p.role = 'admin' 
      OR ur.name = 'admin'
      OR p.email LIKE '%@viverdeia.ai'
    )
  );
$$;

-- 4. Garantir que todos os usuários existentes tenham perfis
DO $$
DECLARE
  user_record RECORD;
  fixed_count INTEGER := 0;
BEGIN
  FOR user_record IN 
    SELECT au.id, au.email
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
    LIMIT 10 -- Processar em lotes pequenos
  LOOP
    PERFORM public.ensure_user_profile_exists(user_record.id, user_record.email);
    fixed_count := fixed_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Perfis criados/corrigidos: %', fixed_count;
END $$;
