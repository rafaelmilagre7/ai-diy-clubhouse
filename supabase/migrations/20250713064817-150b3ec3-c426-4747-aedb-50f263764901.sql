-- Reset dos dados de onboarding para o usuário específico
DELETE FROM public.onboarding_final 
WHERE user_id = 'dc418224-acd7-4f5f-9a7e-e1c981b78fb6';