-- Correção de recursão infinita nas políticas RLS de profiles
-- Problema: políticas consultam profiles recursivamente, travando login

-- 1. Remover políticas problemáticas que causam recursão
DROP POLICY IF EXISTS "profiles_networking_masked" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;

-- 2. Dropar view antiga antes de recriar
DROP VIEW IF EXISTS public.profiles_networking_safe CASCADE;

-- 3. Criar função de verificação de admin via JWT (sem recursão)
CREATE OR REPLACE FUNCTION public.is_user_admin_via_jwt()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.id = (
      SELECT role_id FROM public.profiles WHERE id = auth.uid()
    )
    AND ur.name = 'admin'
  );
$$;

-- 4. Criar política SELECT unificada SEM recursão
CREATE POLICY "profiles_select_unified" 
ON public.profiles 
FOR SELECT
TO authenticated
USING (
  -- Próprio perfil (direto, sem função)
  auth.uid() = id
  OR
  -- Perfis disponíveis para networking
  available_for_networking = true
  OR
  -- Admin (via role_id direto, sem subquery em profiles)
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.id = role_id
    AND ur.name = 'admin'
    AND role_id IS NOT NULL
  )
);

-- 5. Atualizar política de email_queue para usar verificação direta
DROP POLICY IF EXISTS "email_queue_encrypted_access" ON public.email_queue;

CREATE POLICY "email_queue_encrypted_access"
ON public.email_queue
FOR ALL
TO authenticated
USING (
  auth.role() = 'service_role'
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
)
WITH CHECK (
  auth.role() = 'service_role'
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 6. Criar view segura para networking (sem RLS recursivo)
CREATE VIEW public.profiles_networking_safe AS
SELECT 
  p.id,
  CASE 
    WHEN p.available_for_networking THEN p.name
    ELSE mask_personal_name(p.name)
  END as name,
  CASE 
    WHEN p.available_for_networking THEN p.email
    ELSE mask_email(p.email)
  END as email,
  p.whatsapp_number,
  p.avatar_url,
  p.company_name,
  p.current_position,
  p.industry,
  COALESCE(ur.name, 'member') as role,
  p.linkedin_url,
  p.professional_bio,
  p.skills,
  p.created_at,
  NOT p.available_for_networking as is_masked
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id
WHERE p.available_for_networking = true;

-- Comentários de documentação
COMMENT ON POLICY "profiles_select_unified" ON public.profiles IS 
'Política unificada sem recursão: permite ver próprio perfil, perfis públicos de networking, e admins veem todos';

COMMENT ON FUNCTION public.is_user_admin_via_jwt() IS 
'Verifica admin via role_id sem recursão em profiles';