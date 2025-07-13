-- Criar trigger para sincronizar dados do onboarding_final com profiles
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
    onboarding_completed_at = CASE WHEN NEW.is_completed THEN NEW.completed_at ELSE NULL END
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS sync_onboarding_final_to_profile ON public.onboarding_final;
CREATE TRIGGER sync_onboarding_final_to_profile
  AFTER INSERT OR UPDATE ON public.onboarding_final
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_onboarding_final_to_profile();