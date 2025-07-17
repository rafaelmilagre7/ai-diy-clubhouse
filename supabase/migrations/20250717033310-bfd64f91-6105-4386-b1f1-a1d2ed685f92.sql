-- Criar função para identificar usuários legacy
-- Usuários criados antes de uma data específica podem pular o onboarding

CREATE OR REPLACE FUNCTION public.is_legacy_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    CASE 
      WHEN p.created_at < '2024-12-01'::timestamp with time zone THEN true
      WHEN p.created_at IS NULL THEN true  -- Usuários sem data são considerados legacy
      ELSE false
    END
  FROM public.profiles p
  WHERE p.id = user_id;
$$;

-- Marcar usuários existentes como legacy (opcional)
-- Isso garante que usuários atuais não sejam forçados ao onboarding

UPDATE public.profiles 
SET updated_at = now()
WHERE onboarding_completed = false 
AND created_at < '2024-12-01'::timestamp with time zone;