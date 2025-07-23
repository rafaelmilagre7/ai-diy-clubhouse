-- Adicionar campo nina_message se não existir
ALTER TABLE public.onboarding_final 
ADD COLUMN IF NOT EXISTS nina_message TEXT;