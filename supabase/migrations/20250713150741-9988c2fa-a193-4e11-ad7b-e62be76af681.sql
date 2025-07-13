-- Verificar se a tabela onboarding_final tem o campo updated_at
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'onboarding_final' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Se não tiver, adicionar a coluna updated_at
ALTER TABLE public.onboarding_final 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Recriar o trigger corretamente
DROP TRIGGER IF EXISTS update_onboarding_final_updated_at ON public.onboarding_final;

CREATE TRIGGER update_onboarding_final_updated_at
  BEFORE UPDATE ON public.onboarding_final
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_final_updated_at();