
-- Criar políticas RLS para a tabela solution_resources

-- 1. Política para INSERT - Admins podem inserir recursos em qualquer solução
CREATE POLICY "Admins can insert solution resources" 
ON public.solution_resources 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 2. Política para SELECT - Usuários autenticados podem visualizar recursos
CREATE POLICY "Authenticated users can view solution resources" 
ON public.solution_resources 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 3. Política para DELETE - Admins podem deletar recursos
CREATE POLICY "Admins can delete solution resources" 
ON public.solution_resources 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);
