-- Corrigir o trigger que está causando erro
DROP TRIGGER IF EXISTS sync_onboarding_to_profile_trigger ON public.onboarding;

-- Recriar a função sem referenciar updated_at que não existe na tabela profiles
CREATE OR REPLACE FUNCTION public.sync_onboarding_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Atualizar perfil quando onboarding for completado
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    UPDATE public.profiles
    SET 
      name = COALESCE(NEW.name, name),
      company_name = COALESCE(NEW.company_name, company_name),
      industry = COALESCE(NEW.business_sector, industry),
      onboarding_completed = NEW.is_completed,
      onboarding_completed_at = COALESCE(NEW.completed_at, now())
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recriar o trigger
CREATE TRIGGER sync_onboarding_to_profile_trigger
  AFTER UPDATE ON public.onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_onboarding_to_profile();