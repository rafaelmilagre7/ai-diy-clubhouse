-- 1. Recriar função e trigger do updated_at
CREATE OR REPLACE FUNCTION public.update_onboarding_final_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Criar o trigger
DROP TRIGGER IF EXISTS update_onboarding_final_updated_at ON public.onboarding_final;
CREATE TRIGGER update_onboarding_final_updated_at
  BEFORE UPDATE ON public.onboarding_final
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_final_updated_at();

-- 3. Verificar trigger criado
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'onboarding_final' 
AND t.tgname = 'update_onboarding_final_updated_at';