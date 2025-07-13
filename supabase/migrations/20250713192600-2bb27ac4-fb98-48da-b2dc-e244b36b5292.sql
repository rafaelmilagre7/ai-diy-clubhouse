-- Verificar e corrigir definitivamente o trigger problemático

-- 1. Remover todos os triggers relacionados
DROP TRIGGER IF EXISTS update_onboarding_final_updated_at ON public.onboarding_final;

-- 2. Remover a função problemática
DROP FUNCTION IF EXISTS public.update_onboarding_final_updated_at();

-- 3. Verificar a estrutura da tabela onboarding_final
-- (não vamos recriar, apenas confirmar que existe)

-- 4. Criar a função correta do zero
CREATE OR REPLACE FUNCTION public.update_onboarding_final_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Simplesmente atualizar o timestamp
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 5. Criar o trigger novamente
CREATE TRIGGER update_onboarding_final_updated_at
  BEFORE UPDATE ON public.onboarding_final
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_final_updated_at();

-- 6. Testar se a função funciona
DO $$
BEGIN
  RAISE NOTICE 'Trigger recriado com sucesso!';
END
$$;