-- Corrigir a função sync_onboarding_final_to_profile que está causando erro
-- O problema é que ela tenta acessar NEW.completed_at que pode ser NULL durante INSERT

CREATE OR REPLACE FUNCTION public.sync_onboarding_final_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar perfil quando onboarding_final for modificado
  UPDATE public.profiles
  SET 
    name = COALESCE(NEW.personal_info->>'name', name),
    company_name = COALESCE(NEW.business_info->>'company_name', company_name),
    industry = COALESCE(NEW.business_info->>'company_sector', industry),
    onboarding_completed = NEW.is_completed,
    -- Corrigir: usar now() quando is_completed for true, senão NULL
    onboarding_completed_at = CASE 
      WHEN NEW.is_completed THEN COALESCE(NEW.completed_at, now()) 
      ELSE NULL 
    END
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;