
-- Adicionar políticas RLS necessárias para a tabela solution_tools
-- Permitir que administradores possam inserir, atualizar e deletar ferramentas de soluções

CREATE POLICY "Admins can insert solution tools" 
ON public.solution_tools 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

CREATE POLICY "Admins can update solution tools" 
ON public.solution_tools 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

CREATE POLICY "Admins can delete solution tools" 
ON public.solution_tools 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);
