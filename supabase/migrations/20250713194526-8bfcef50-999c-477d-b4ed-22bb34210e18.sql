-- Corrigir o trigger que está impedindo o salvamento dos dados
-- O problema é que o trigger ainda está tentando acessar um campo incorreto

-- Primeiro, verificar se existe e remover o trigger problemático
DROP TRIGGER IF EXISTS update_onboarding_final_updated_at ON public.onboarding_final;

-- Agora criar a função correta sem erro de sintaxe
CREATE OR REPLACE FUNCTION public.update_onboarding_final_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Atualizar o campo updated_at corretamente
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recriar o trigger com a função correta
CREATE TRIGGER update_onboarding_final_updated_at
  BEFORE UPDATE ON public.onboarding_final
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_final_updated_at();