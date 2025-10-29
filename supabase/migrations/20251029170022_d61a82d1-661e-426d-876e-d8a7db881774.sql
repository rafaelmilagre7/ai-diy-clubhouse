-- Remover DEFAULT do campo user_type para forçar seleção no Step 0
ALTER TABLE public.onboarding_final 
ALTER COLUMN user_type DROP DEFAULT;

-- Comentar a mudança
COMMENT ON COLUMN public.onboarding_final.user_type IS 
'Tipo de usuário: entrepreneur ou learner. Deve ser NULL até o usuário escolher no Step 0';

-- Limpar registros existentes com user_type incorreto
-- Resetar para NULL quando está no Step 0 com dados vazios
UPDATE public.onboarding_final
SET user_type = NULL
WHERE 
  current_step = 0
  AND personal_info = '{}'::jsonb
  AND is_completed = false
  AND user_type IS NOT NULL;

-- Log para verificação
DO $$
DECLARE
  affected_count INTEGER;
BEGIN
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RAISE NOTICE 'Resetados % registros com user_type incorreto', affected_count;
END $$;