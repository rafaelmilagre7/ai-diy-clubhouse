-- Fix RLS policies for solutions table to allow admins to manage solutions

-- 1. Create comprehensive RLS policies for solutions table
CREATE POLICY "solutions_admin_full_access" 
ON public.solutions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 2. Create policy for authenticated users to view published solutions
CREATE POLICY "solutions_authenticated_view_published" 
ON public.solutions 
FOR SELECT 
USING (
  published = true AND auth.uid() IS NOT NULL
);

-- 3. Drop the old policy that was causing conflicts
DROP POLICY IF EXISTS "solutions_public_published_only" ON public.solutions;

-- 4. Add any missing required helper functions for future use
CREATE OR REPLACE FUNCTION public.generate_certificate_validation_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT string_agg(
    substring('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 
    ceil(random() * 32)::integer, 1), '')
  FROM generate_series(1, 12);
$$;

-- 5. Create function to generate invite tokens if not exists
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT encode(gen_random_bytes(32), 'base64');
$$;

-- 6. Ensure is_user_admin function exists and works correctly
CREATE OR REPLACE FUNCTION public.is_user_admin(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = target_user_id 
    AND ur.name = 'admin'
  ) OR EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.id = target_user_id 
    AND p.email LIKE '%@viverdeia.ai'
  );
$$;