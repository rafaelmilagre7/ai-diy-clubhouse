
-- CORREÇÃO DEFINITIVA DA FUNÇÃO get_user_profile_optimized
-- Esta função estava retornando dados em formato tuple, causando erro no JavaScript
-- Agora retorna JSON estruturado que o AuthContext consegue processar

DROP FUNCTION IF EXISTS public.get_user_profile_optimized(uuid);

CREATE OR REPLACE FUNCTION public.get_user_profile_optimized(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  profile_data jsonb;
  role_data jsonb;
BEGIN
  -- Log para debug
  RAISE NOTICE '[PROFILE_OPTIMIZED] Buscando perfil para: %', target_user_id;
  
  -- Buscar dados do perfil
  SELECT jsonb_build_object(
    'id', p.id,
    'email', p.email,
    'name', p.name,
    'company_name', p.company_name,
    'role_id', p.role_id,
    'role', p.role,
    'onboarding_completed', COALESCE(p.onboarding_completed, false),
    'onboarding_completed_at', p.onboarding_completed_at,
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

-- Garantir que a função is_user_admin_fast também funciona corretamente
CREATE OR REPLACE FUNCTION public.is_user_admin_fast(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = target_user_id 
    AND ur.name = 'admin'
  ) OR EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.id = target_user_id 
    AND p.email LIKE '%@viverdeia.ai'
  );
$$;

-- Log da correção
INSERT INTO public.audit_logs (
  event_type,
  action,
  details
) VALUES (
  'auth_fix',
  'corrected_profile_function',
  jsonb_build_object(
    'message', 'Função get_user_profile_optimized corrigida para retornar JSON',
    'issue_resolved', 'Formato tuple causando erro no AuthContext',
    'timestamp', NOW()
  )
);
