-- Fix RLS policies for solutions table to allow admins to manage solutions

-- 1. Drop the old conflicting policy
DROP POLICY IF EXISTS "solutions_public_published_only" ON public.solutions;

-- 2. Create comprehensive RLS policy for admins to manage solutions
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

-- 3. Create policy for authenticated users to view published solutions
CREATE POLICY "solutions_authenticated_view_published" 
ON public.solutions 
FOR SELECT 
USING (
  published = true AND auth.uid() IS NOT NULL
);

-- 4. Create fallback policy for users with email @viverdeia.ai (admin fallback)
CREATE POLICY "solutions_admin_email_access" 
ON public.solutions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.email LIKE '%@viverdeia.ai'
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.email LIKE '%@viverdeia.ai'
  )
);