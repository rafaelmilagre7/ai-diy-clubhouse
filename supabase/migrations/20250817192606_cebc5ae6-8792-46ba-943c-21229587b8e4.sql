-- Tornar apenas 'admin' como papel de sistema, resto personalizado
UPDATE public.user_roles 
SET is_system = false, updated_at = now()
WHERE name != 'admin';

-- Garantir que 'admin' seja papel de sistema
UPDATE public.user_roles 
SET is_system = true, updated_at = now()
WHERE name = 'admin';