-- Criar política RLS para permitir que administradores insiram ferramentas
CREATE POLICY "Admins can insert tools" 
ON public.tools 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
);