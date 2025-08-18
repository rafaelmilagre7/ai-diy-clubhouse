-- Função segura para expor contatos básicos de networking sem quebrar RLS de tabelas base
CREATE OR REPLACE FUNCTION public.get_networking_contacts(p_user_ids uuid[])
RETURNS TABLE(
  user_id uuid,
  phone text,
  linkedin_url text,
  company_name text,
  current_position text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    onf.user_id,
    COALESCE(onf.personal_info->>'phone', onf.business_info->>'phone') AS phone,
    COALESCE(onf.personal_info->>'linkedin_url', onf.business_info->>'linkedin_url') AS linkedin_url,
    COALESCE(onf.business_info->>'company_name', onf.professional_info->>'company_name') AS company_name,
    COALESCE(onf.business_info->>'current_position', onf.professional_info->>'current_position') AS current_position
  FROM public.onboarding_final onf
  WHERE onf.user_id = ANY(p_user_ids);
END;
$$;