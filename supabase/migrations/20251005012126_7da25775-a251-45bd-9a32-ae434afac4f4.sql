-- Migração de Segurança: Proteger dados pessoais (estrutura correta)

-- Função para verificar permissão de visualização completa
CREATE OR REPLACE FUNCTION public.can_view_full_profile(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT (
    auth.uid() = target_user_id 
    OR EXISTS (
      SELECT 1 FROM profiles p
      INNER JOIN user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );
$$;

-- Função RPC para obter perfil seguro
CREATE OR REPLACE FUNCTION public.get_safe_profile(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  profile_data jsonb;
  can_view_full boolean;
BEGIN
  can_view_full := public.can_view_full_profile(target_user_id);
  SELECT to_jsonb(p.*) INTO profile_data FROM profiles p WHERE p.id = target_user_id;
  
  IF profile_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  IF NOT can_view_full THEN
    profile_data := jsonb_set(profile_data, '{email}', to_jsonb(public.mask_email(profile_data->>'email')));
    
    IF profile_data ? 'whatsapp_number' AND profile_data->>'whatsapp_number' IS NOT NULL THEN
      profile_data := jsonb_set(profile_data, '{whatsapp_number}', to_jsonb('***-***-****'));
    END IF;
    
    IF profile_data ? 'linkedin_url' AND profile_data->>'linkedin_url' IS NOT NULL THEN
      profile_data := jsonb_set(profile_data, '{linkedin_url}', to_jsonb('https://linkedin.com/in/***'));
    END IF;
    
    IF profile_data ? 'master_email' AND profile_data->>'master_email' IS NOT NULL THEN
      profile_data := jsonb_set(profile_data, '{master_email}', to_jsonb(public.mask_email(profile_data->>'master_email')));
    END IF;
  END IF;
  
  RETURN profile_data;
END;
$$;

-- View segura com mascaramento
CREATE OR REPLACE VIEW public.profiles_safe AS
SELECT 
  p.id,
  CASE WHEN public.can_view_full_profile(p.id) THEN p.name ELSE public.mask_personal_name(p.name) END as name,
  CASE WHEN public.can_view_full_profile(p.id) THEN p.email ELSE public.mask_email(p.email) END as email,
  p.avatar_url,
  p.company_name,
  p.industry,
  p.current_position,
  p.professional_bio,
  p.skills,
  p.role_id,
  p.is_master_user,
  p.onboarding_completed,
  p.created_at,
  p.updated_at,
  p.organization_id,
  p.available_for_networking,
  CASE WHEN public.can_view_full_profile(p.id) THEN p.whatsapp_number ELSE NULL END as whatsapp_number,
  CASE WHEN public.can_view_full_profile(p.id) THEN p.linkedin_url ELSE NULL END as linkedin_url,
  CASE WHEN public.can_view_full_profile(p.id) THEN p.master_email ELSE NULL END as master_email
FROM public.profiles p;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_id_security ON public.profiles(role_id) WHERE role_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id_security ON public.profiles(organization_id) WHERE organization_id IS NOT NULL;