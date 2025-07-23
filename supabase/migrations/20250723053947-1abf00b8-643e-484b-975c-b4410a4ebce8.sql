-- Atualizar personal_info no onboarding para incluir novos campos opcionais
UPDATE public.onboarding_final 
SET personal_info = personal_info || jsonb_build_object(
  'instagram_url', '',
  'linkedin_url', '',
  'profile_picture', '',
  'fun_fact', ''
)
WHERE personal_info IS NOT NULL
  AND NOT (personal_info ? 'instagram_url' AND personal_info ? 'linkedin_url' AND personal_info ? 'profile_picture' AND personal_info ? 'fun_fact');