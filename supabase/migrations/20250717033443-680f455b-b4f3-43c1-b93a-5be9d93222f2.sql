-- Ajustar função para considerar usuários criados antes de julho 2025 como legacy
-- Isso garante que usuários atuais como Diego Malta possam navegar livremente

CREATE OR REPLACE FUNCTION public.is_legacy_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    CASE 
      WHEN p.created_at < '2025-07-01'::timestamp with time zone THEN true
      WHEN p.created_at IS NULL THEN true  -- Usuários sem data são considerados legacy
      ELSE false
    END
  FROM public.profiles p
  WHERE p.id = user_id;
$$;