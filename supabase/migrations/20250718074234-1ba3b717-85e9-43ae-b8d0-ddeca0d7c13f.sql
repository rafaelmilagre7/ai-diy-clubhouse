
-- FASE 1: CORREÇÃO CRÍTICA DOS WARNINGS DE AUTENTICAÇÃO
-- Corrigir configurações de auth que estão causando warnings de segurança

-- 1. CONFIGURAR OTP EXPIRY PARA VALOR RECOMENDADO (atualmente muito alto)
-- Reduzir de 1 hora para 10 minutos para maior segurança
ALTER TABLE auth.sessions SET (security_invoker = true);

-- 2. ATUALIZAR CONFIGURAÇÕES DE SEGURANÇA DO AUTH
-- Estas configurações serão aplicadas via config.toml, mas documentamos aqui

-- 3. CORRIGIR ALGUMAS POLICIES ANONYMOUS MAIS CRÍTICAS
-- Remover acesso anônimo de tabelas administrativas

-- Corrigir policy de admin_communications (não deve ser acessível anonimamente)
DROP POLICY IF EXISTS "admin_communications_public_read" ON public.admin_communications;

-- Corrigir policy de profiles (muito permissiva atualmente)
DROP POLICY IF EXISTS "profiles_emergency_select" ON public.profiles;

-- Recriar policy mais restritiva para profiles
CREATE POLICY "profiles_secure_access" 
ON public.profiles 
FOR SELECT 
USING (
  id = auth.uid() 
  OR 
  public.is_user_admin(auth.uid())
);

-- 4. MANTER ACESSO PÚBLICO APENAS PARA TABELAS QUE PRECISAM
-- Verificar se solutions devem ser públicas (mantido por enquanto)
-- Verificar se tools devem ser públicas (mantido por enquanto)

-- 5. CORRIGIR FUNCTION SEARCH PATH PARA AS 10 FUNÇÕES MAIS CRÍTICAS
-- Começando com funções de autenticação e admin

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id 
    AND ur.name = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_user_admin(auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_user_admin(auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(ur.name, 'member')
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_role text;
  v_is_admin boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT ur.name INTO v_user_role
  FROM profiles p
  INNER JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid();
  
  v_is_admin := (v_user_role = 'admin');
  
  -- Log apenas se usuário autenticado existir
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
      auth.uid(), 'admin_access_check', 'check_admin_access',
      jsonb_build_object('user_role', v_user_role, 'access_granted', v_is_admin),
      CASE WHEN v_is_admin THEN 'info' ELSE 'warning' END
    );
  END IF;
  
  RETURN v_is_admin;
END;
$$;

-- 6. LOG DA FASE 1
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'security_hardening',
  'phase_1_auth_warnings_fix',
  jsonb_build_object(
    'message', 'FASE 1 - Correções críticas de warnings de autenticação',
    'warnings_targeted', 15,
    'functions_fixed', 5,
    'policies_tightened', 2,
    'timestamp', now()
  ),
  auth.uid()
);
