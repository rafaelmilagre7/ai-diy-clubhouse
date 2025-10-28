-- Remover política RLS duplicada criada por engano
-- A função get_users_with_filters_v2 usa SECURITY DEFINER, não precisa dessa política

DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;