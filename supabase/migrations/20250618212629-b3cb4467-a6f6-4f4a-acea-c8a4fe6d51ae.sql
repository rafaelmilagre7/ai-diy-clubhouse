
-- Corrigir políticas RLS da tabela tools para usar user_roles em vez de profiles.role
-- Remover políticas existentes que usam profiles.role incorretamente
DROP POLICY IF EXISTS "Admins can insert tools" ON public.tools;
DROP POLICY IF EXISTS "Admins can update tools" ON public.tools;
DROP POLICY IF EXISTS "Admins can delete tools" ON public.tools;

-- Criar políticas corretas usando user_roles
CREATE POLICY "Admins can insert tools"
ON public.tools FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

CREATE POLICY "Admins can update tools"
ON public.tools FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

CREATE POLICY "Admins can delete tools"
ON public.tools FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Corrigir views com SECURITY DEFINER
-- 1. Recriar view suggestions_with_profiles sem SECURITY DEFINER
DROP VIEW IF EXISTS public.suggestions_with_profiles;
CREATE VIEW public.suggestions_with_profiles AS
SELECT 
  s.*,
  p.name as user_name,
  p.avatar_url as user_avatar
FROM public.suggestions s
LEFT JOIN public.profiles p ON s.user_id = p.id;

-- 2. Recriar view user_progress sem SECURITY DEFINER (apenas com colunas que existem)
DROP VIEW IF EXISTS public.user_progress;
CREATE VIEW public.user_progress AS
SELECT 
  p.user_id,
  p.solution_id,
  p.is_completed,
  p.created_at,
  s.title as solution_title,
  s.category as solution_category
FROM public.progress p
LEFT JOIN public.solutions s ON p.solution_id = s.id;

-- 3. Recriar view users_with_roles sem SECURITY DEFINER
DROP VIEW IF EXISTS public.users_with_roles;
CREATE VIEW public.users_with_roles AS
SELECT 
  p.id,
  p.email,
  p.name,
  p.avatar_url,
  p.company_name,
  p.industry,
  p.created_at,
  ur.name as role_name,
  ur.description as role_description
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id;

-- Adicionar função helper para debug de permissões de ferramentas
CREATE OR REPLACE FUNCTION public.debug_tool_permissions(user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  user_role text;
  has_admin_role boolean;
BEGIN
  -- Verificar role do usuário
  SELECT ur.name INTO user_role
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = user_id;
  
  -- Verificar se tem role de admin
  has_admin_role := (user_role = 'admin');
  
  result := jsonb_build_object(
    'user_id', user_id,
    'user_role', COALESCE(user_role, 'no_role'),
    'has_admin_role', has_admin_role,
    'can_create_tools', has_admin_role,
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$;
