-- Correção de Acesso às Ferramentas: Política RLS baseada em permissões da role
-- Remove política restritiva antiga e cria uma nova que respeita permissions->>'tools'

-- Remover política antiga que não verificava permissões corretamente
DROP POLICY IF EXISTS "tools_authenticated_users_only" ON public.tools;

-- Criar nova política que verifica permissões da role do usuário
CREATE POLICY "tools_users_with_permission" ON public.tools
FOR SELECT
TO authenticated
USING (
  status = true 
  AND (
    -- Admins têm acesso total
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      INNER JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() 
        AND ur.name = 'admin'
    )
    OR
    -- Usuários cuja role tem permissions->>'tools' = 'true'
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      INNER JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() 
        AND ur.permissions->>'tools' = 'true'
    )
    OR
    -- Controle fino via benefit_access_control (mantido para compatibilidade)
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      INNER JOIN public.benefit_access_control bac ON bac.role_id = p.role_id
      WHERE p.id = auth.uid() 
        AND bac.tool_id = tools.id
    )
  )
);