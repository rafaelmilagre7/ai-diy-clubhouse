-- =============================================================================
-- CONSOLIDAÇÃO DE POLÍTICAS RLS DA TABELA PROFILES
-- Remove 13 políticas conflitantes e cria 4 políticas claras e seguras
-- =============================================================================

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES CONFLITANTES
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Apenas admins podem alterar roles de usuários" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile via function" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins can update all" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu perfil (exceto role)" ON public.profiles;
DROP POLICY IF EXISTS "profiles_final_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_final_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_final_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_insert_v2" ON public.profiles;
DROP POLICY IF EXISTS "restricted_profile_creation" ON public.profiles;

-- 2. CRIAR 4 POLÍTICAS CONSOLIDADAS E CLARAS

-- POLÍTICA 1: SELECT - Usuários veem seu próprio perfil + Admins veem todos
CREATE POLICY "profiles_consolidated_select"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (auth.uid() = id) OR 
  public.is_user_admin_secure(auth.uid())
);

-- POLÍTICA 2: INSERT - Usuários criam apenas seu próprio perfil
CREATE POLICY "profiles_consolidated_insert"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = id) AND 
  (auth.uid() IS NOT NULL)
);

-- POLÍTICA 3: UPDATE - Usuários atualizam seu próprio (exceto role_id) + Admins atualizam tudo
CREATE POLICY "profiles_consolidated_update"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = id) OR 
  public.is_user_admin_secure(auth.uid())
)
WITH CHECK (
  -- Para usuários normais: podem atualizar seu próprio perfil mas NÃO podem alterar role_id
  (
    (auth.uid() = id) AND 
    (role_id = (SELECT role_id FROM public.profiles WHERE id = auth.uid()))
  ) OR
  -- Para admins: podem atualizar qualquer perfil incluindo role_id
  public.is_user_admin_secure(auth.uid())
);

-- POLÍTICA 4: DELETE - Apenas administradores podem deletar perfis
CREATE POLICY "profiles_consolidated_delete"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  public.is_user_admin_secure(auth.uid())
);

-- 3. LOG DA CONSOLIDAÇÃO PARA AUDITORIA
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_improvement',
  'rls_policies_consolidated',
  jsonb_build_object(
    'table', 'profiles',
    'removed_policies', 13,
    'created_policies', 4,
    'consolidation_date', NOW(),
    'security_improvements', ARRAY[
      'Removed conflicting policies',
      'Eliminated privacy breach (any user viewing any profile)',
      'Protected role_id field from unauthorized changes',
      'Simplified policy evaluation for better performance',
      'Used consistent security functions (is_user_admin_secure)'
    ]
  ),
  'info'
);

-- 4. VERIFICAÇÃO FINAL
COMMENT ON TABLE public.profiles IS 'Tabela de perfis com políticas RLS consolidadas: 4 políticas claras (SELECT, INSERT, UPDATE, DELETE) que garantem segurança e performance. Consolidado em ' || NOW()::text;