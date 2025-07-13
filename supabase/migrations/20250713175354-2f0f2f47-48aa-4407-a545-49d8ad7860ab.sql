-- Fix do trigger que está causando o erro de salvamento
-- O problema é que o trigger está tentando acessar um campo updated_at que não existe

-- Primeiro, remover o trigger problemático
DROP TRIGGER IF EXISTS update_onboarding_final_updated_at ON public.onboarding_final;

-- Agora criar um trigger correto para a tabela onboarding_final
CREATE OR REPLACE FUNCTION public.update_onboarding_final_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- A tabela onboarding_final tem 'updated_at', não 'updated_at'
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recriar o trigger com a função correta
CREATE TRIGGER update_onboarding_final_updated_at
  BEFORE UPDATE ON public.onboarding_final
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_final_updated_at();