-- Verificar se a função existe
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'update_onboarding_final_updated_at';

-- Recriar a função e trigger
CREATE OR REPLACE FUNCTION public.update_onboarding_final_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Garantir que não há trigger duplicado
DROP TRIGGER IF EXISTS update_onboarding_final_updated_at ON public.onboarding_final;

-- Criar o trigger
CREATE TRIGGER update_onboarding_final_updated_at
  BEFORE UPDATE ON public.onboarding_final
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_final_updated_at();

-- Verificar se foi criado
SELECT tgname as trigger_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'onboarding_final';