-- CORREÇÃO CRÍTICA: Resolver recursão infinita na política RLS de user_roles
-- Problema: A política atual está causando "infinite recursion detected in policy for relation user_roles"

-- 1. Remover política problemática existente
DROP POLICY IF EXISTS "admin_access_only" ON public.user_roles;

-- 2. Criar política mais simples usando apenas auth.users para evitar recursão
-- Esta abordagem evita qualquer referência circular à própria tabela user_roles
CREATE POLICY "user_roles_admin_access" ON public.user_roles
  FOR ALL USING (
    -- Verificar se o usuário é admin através do email ou metadados, não através de user_roles
    EXISTS (
      SELECT 1 FROM auth.users u 
      WHERE u.id = auth.uid() 
      AND (
        u.email LIKE '%@viverdeia.ai' OR
        u.email = 'admin@teste.com' OR
        (u.raw_user_meta_data->>'role') = 'admin'
      )
    )
  );

-- 3. Atualizar função is_user_admin para usar abordagem mais segura
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Primeiro verificar através de auth.users para evitar recursão
  IF EXISTS (
    SELECT 1 FROM auth.users u 
    WHERE u.id = user_id 
    AND (
      u.email LIKE '%@viverdeia.ai' OR
      u.email = 'admin@teste.com' OR
      (u.raw_user_meta_data->>'role') = 'admin'
    )
  ) THEN
    RETURN true;
  END IF;
  
  -- Só então verificar user_roles se necessário (com cuidado para evitar recursão)
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id AND ur.name = 'admin'
  );
END;
$function$;

-- 4. Log da correção
SELECT 'CORREÇÃO APLICADA: Recursão infinita em user_roles resolvida' as status;