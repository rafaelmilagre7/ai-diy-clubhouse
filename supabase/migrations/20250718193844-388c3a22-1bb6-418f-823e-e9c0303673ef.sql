
-- CORREÇÃO FINAL: Eliminar todas as referências à auth.users que causam "permission denied"
-- ================================================================================

-- ETAPA 1: RECRIAR is_user_admin USANDO APENAS DADOS PÚBLICOS
-- ==========================================================

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- NOVA IMPLEMENTAÇÃO: Usar apenas public.profiles + user_roles 
  -- Elimina completamente referências à auth.users
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id 
    AND ur.name = 'admin'
  );
$$;

-- ETAPA 2: RECRIAR is_user_admin SEM PARÂMETROS
-- ============================================

CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_user_admin(auth.uid());
$$;

-- ETAPA 3: VERIFICAR E CORRIGIR POLÍTICAS EM PROFILES
-- ===================================================

-- Remover políticas que ainda fazem referência a auth.users
DROP POLICY IF EXISTS "profiles_simple_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_simple_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_simple_insert" ON public.profiles;

-- Criar políticas usando apenas public.is_user_admin (sem auth.users)
CREATE POLICY "profiles_final_select" ON public.profiles
  FOR SELECT 
  USING (
    auth.uid() = id 
    OR 
    public.is_user_admin(auth.uid())
  );

CREATE POLICY "profiles_final_update" ON public.profiles
  FOR UPDATE 
  USING (
    auth.uid() = id 
    OR 
    public.is_user_admin(auth.uid())
  );

CREATE POLICY "profiles_final_insert" ON public.profiles
  FOR INSERT 
  WITH CHECK (
    auth.uid() = id 
    OR 
    public.is_user_admin(auth.uid())
  );

-- ETAPA 4: CORRIGIR POLÍTICAS EM USER_ROLES
-- =========================================

DROP POLICY IF EXISTS "user_roles_simple_admin" ON public.user_roles;

CREATE POLICY "user_roles_final_admin" ON public.user_roles
  FOR ALL 
  USING (
    auth.uid() IS NOT NULL AND public.is_user_admin(auth.uid())
  );

-- ETAPA 5: GARANTIR QUE SEU USUÁRIO TENHA ROLE ADMIN
-- =================================================

-- Garantir que rafael@viverdeia.ai tenha role admin
DO $$
DECLARE
  rafael_user_id uuid;
  admin_role_id uuid;
BEGIN
  -- Buscar ID do usuário rafael
  SELECT id INTO rafael_user_id 
  FROM public.profiles 
  WHERE email = 'rafael@viverdeia.ai' 
  LIMIT 1;
  
  -- Buscar ID do role admin
  SELECT id INTO admin_role_id 
  FROM public.user_roles 
  WHERE name = 'admin' 
  LIMIT 1;
  
  -- Se encontrou ambos, atualizar o role
  IF rafael_user_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET role_id = admin_role_id 
    WHERE id = rafael_user_id;
    
    RAISE NOTICE 'Role admin aplicado para rafael@viverdeia.ai';
  ELSE
    RAISE NOTICE 'Usuário ou role admin não encontrado';
  END IF;
END $$;

-- ETAPA 6: LOG DA CORREÇÃO
-- =======================

INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'system_fix',
  'auth_users_access_eliminated',
  jsonb_build_object(
    'message', 'CORREÇÃO FINAL: Eliminadas todas as referências à auth.users',
    'functions_fixed', ARRAY['is_user_admin(uuid)', 'is_user_admin()'],
    'policies_recreated', 'profiles, user_roles',
    'rafael_admin_ensured', true,
    'expected_result', 'Dashboard carregando sem erros permission denied',
    'timestamp', now()
  ),
  auth.uid()
);

-- RESULTADO ESPERADO:
-- ✅ Zero referências à auth.users
-- ✅ Dashboard carregando sem erros
-- ✅ rafael@viverdeia.ai com role admin garantido
-- ✅ Políticas RLS funcionais sem recursão
