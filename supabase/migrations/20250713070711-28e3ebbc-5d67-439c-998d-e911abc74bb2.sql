-- Corrigir o trigger de updated_at na tabela onboarding_final
DROP TRIGGER IF EXISTS update_onboarding_final_updated_at ON public.onboarding_final;

-- Recriar trigger com nome correto
CREATE OR REPLACE FUNCTION public.update_onboarding_final_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Criar trigger atualizado
CREATE TRIGGER update_onboarding_final_updated_at
  BEFORE UPDATE ON public.onboarding_final
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_final_updated_at();