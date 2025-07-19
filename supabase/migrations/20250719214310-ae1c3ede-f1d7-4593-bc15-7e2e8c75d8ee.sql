
-- CORREÇÃO CRÍTICA: Atualizar função get_user_profile_optimized
-- Remove campos de onboarding que não existem mais na tabela profiles

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

-- Verificar se as colunas de onboarding foram removidas corretamente
DO $$ 
BEGIN
  -- Se ainda existirem, remover
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE public.profiles DROP COLUMN onboarding_completed CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'profiles' AND column_name = 'onboarding_completed_at') THEN
    ALTER TABLE public.profiles DROP COLUMN onboarding_completed_at CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'profiles' AND column_name = 'onboarding_step') THEN
    ALTER TABLE public.profiles DROP COLUMN onboarding_step CASCADE;
  END IF;
END $$;

-- Log da correção
INSERT INTO public.audit_logs (
  event_type,
  action,
  details
) VALUES (
  'system_fix',
  'corrected_profile_function_final',
  jsonb_build_object(
    'message', 'Função get_user_profile_optimized corrigida definitivamente',
    'issue_resolved', 'Campos de onboarding removidos da função',
    'timestamp', NOW()
  )
);
