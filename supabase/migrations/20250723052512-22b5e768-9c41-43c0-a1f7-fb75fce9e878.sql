-- Migração para adicionar suporte a telefone internacional no onboarding
-- Atualizar estrutura do personal_info para incluir country_code

-- 1. Migrar telefones brasileiros existentes para formato internacional
UPDATE public.onboarding_final 
SET personal_info = personal_info || jsonb_build_object(
  'phone', '+55|' || (personal_info->>'phone'),
  'country_code', 'BR'
)
WHERE personal_info ? 'phone' 
  AND NOT (personal_info->>'phone' LIKE '+%|%');

-- 2. Para registros que não têm phone, definir valores padrão
UPDATE public.onboarding_final 
SET personal_info = personal_info || jsonb_build_object(
  'phone', '+55|',
  'country_code', 'BR'
)
WHERE NOT personal_info ? 'phone';

-- 3. Garantir que todos os registros tenham o country_code
UPDATE public.onboarding_final 
SET personal_info = personal_info || jsonb_build_object(
  'country_code', 'BR'
)
WHERE personal_info ? 'phone' 
  AND NOT personal_info ? 'country_code';