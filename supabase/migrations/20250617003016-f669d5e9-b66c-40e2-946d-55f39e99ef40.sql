
-- Primeiro, vamos verificar e limpar as funções is_admin existentes
-- Depois criar uma versão unificada e clara

-- Remover possíveis versões duplicadas da função is_admin
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Criar uma função is_admin unificada e clara
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  -- Se não especificar user_id, usa o usuário atual
  WITH target_user AS (
    SELECT COALESCE(check_user_id, auth.uid()) as user_id
  )
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = (SELECT user_id FROM target_user)
    AND ur.name = 'admin'
    AND ur.is_system = true
  );
$$;

-- Agora criar as políticas RLS para event_access_control usando a função corrigida
CREATE POLICY "Admins can view event access control" 
ON public.event_access_control 
FOR SELECT 
TO authenticated
USING (public.is_admin());

-- Política para INSERT: Admins podem criar novos controles de acesso
CREATE POLICY "Admins can create event access control" 
ON public.event_access_control 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin());

-- Política para DELETE: Admins podem deletar controles de acesso existentes
CREATE POLICY "Admins can delete event access control" 
ON public.event_access_control 
FOR DELETE 
TO authenticated
USING (public.is_admin());

-- Política para UPDATE: Admins podem atualizar controles de acesso
CREATE POLICY "Admins can update event access control" 
ON public.event_access_control 
FOR UPDATE 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
