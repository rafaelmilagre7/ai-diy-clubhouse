-- Criar política para permitir que admins deletem sugestões
CREATE POLICY "suggestions_admin_delete_policy" 
ON public.suggestions 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM profiles p 
    JOIN user_roles ur ON p.role_id = ur.id 
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
);

-- Criar política para permitir que admins atualizem sugestões
CREATE POLICY "suggestions_admin_update_policy" 
ON public.suggestions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM profiles p 
    JOIN user_roles ur ON p.role_id = ur.id 
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
);

-- Permitir que proprietários da sugestão também possam deletar e atualizar suas próprias sugestões
CREATE POLICY "suggestions_owner_update_policy" 
ON public.suggestions 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "suggestions_owner_delete_policy" 
ON public.suggestions 
FOR DELETE 
USING (user_id = auth.uid());