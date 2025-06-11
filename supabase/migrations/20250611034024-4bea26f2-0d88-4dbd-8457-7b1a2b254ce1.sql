
-- Remover as 3 políticas RLS antigas que usam profiles.role (causando conflito)
-- Estas políticas estão duplicadas e conflitando com as novas que usam user_roles

DROP POLICY IF EXISTS "Users can view events" ON public.events;

DROP POLICY IF EXISTS "Users can create events" ON public.events;

DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
