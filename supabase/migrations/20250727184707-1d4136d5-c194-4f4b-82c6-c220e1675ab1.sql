-- Habilitar RLS na view nps_analytics_view
ALTER VIEW public.nps_analytics_view SET (security_barrier = true);

-- Criar política para admins acessarem analytics de NPS
CREATE POLICY "nps_analytics_admin_access"
ON public.nps_analytics_view
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
);