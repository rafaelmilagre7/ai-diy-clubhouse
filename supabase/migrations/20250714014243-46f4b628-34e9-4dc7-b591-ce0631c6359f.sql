-- Corrigir APENAS os dados inconsistentes

-- 1. Marcar onboarding como completo para o usuário atual
UPDATE public.onboarding 
SET is_completed = true, 
    completed_at = now()
WHERE user_id = 'dc418224-acd7-4f5f-9a7e-e1c981b78fb6' 
  AND is_completed = false;

-- 2. Sincronizar profile do usuário atual  
UPDATE public.profiles 
SET onboarding_completed = true,
    onboarding_completed_at = now()
WHERE id = 'dc418224-acd7-4f5f-9a7e-e1c981b78fb6' 
  AND onboarding_completed = false;