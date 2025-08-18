-- Criar função para verificar se usuário tem acesso a soluções
CREATE OR REPLACE FUNCTION public.user_has_solutions_access(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role_id uuid;
  has_access boolean := false;
BEGIN
  -- Se não há usuário autenticado, negar acesso
  IF check_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Buscar role_id do usuário
  SELECT role_id INTO user_role_id
  FROM public.profiles
  WHERE id = check_user_id;
  
  -- Se não encontrou perfil, negar acesso
  IF user_role_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se é admin (admin sempre tem acesso)
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.id = user_role_id 
    AND ur.name = 'admin'
  ) INTO has_access;
  
  -- Se já é admin, retornar true
  IF has_access THEN
    RETURN true;
  END IF;
  
  -- Verificar se tem permissão específica para soluções
  SELECT EXISTS (
    SELECT 1
    FROM public.role_permissions rp
    JOIN public.permission_definitions pd ON rp.permission_id = pd.id
    WHERE rp.role_id = user_role_id
    AND pd.code = 'solutions.access'
  ) INTO has_access;
  
  RETURN has_access;
END;
$$;

-- Atualizar política RLS da tabela solutions para verificar permissões
DROP POLICY IF EXISTS solutions_authenticated_view_published ON public.solutions;

CREATE POLICY "solutions_permission_based_access"
ON public.solutions
FOR SELECT
TO authenticated
USING (
  -- Admin ou email @viverdeia.ai tem acesso total
  (EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.email LIKE '%@viverdeia.ai'
  )) OR
  -- Usuários com permissão específica podem ver apenas soluções publicadas
  (public.user_has_solutions_access(auth.uid()) AND published = true)
);

-- Log da migração
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'permission_system',
  'solutions_access_control_implemented',
  jsonb_build_object(
    'description', 'Implementado controle de acesso baseado em permissões para soluções',
    'functions_created', ARRAY['user_has_solutions_access'],
    'policies_updated', ARRAY['solutions_permission_based_access']
  ),
  'info'
);