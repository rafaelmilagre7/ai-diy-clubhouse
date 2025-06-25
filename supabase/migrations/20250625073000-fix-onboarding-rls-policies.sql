
-- CORREÇÃO CRÍTICA: Ajustar políticas RLS para permitir onboarding
-- Problema: Políticas muito restritivas estão bloqueando acesso durante onboarding

-- 1. Remover as políticas que bloqueiam completamente o acesso sem onboarding
DROP POLICY IF EXISTS "block_incomplete_onboarding_access" ON public.solutions;
DROP POLICY IF EXISTS "block_incomplete_onboarding_tools" ON public.tools;
DROP POLICY IF EXISTS "block_incomplete_onboarding_progress" ON public.progress;

-- 2. Criar políticas mais flexíveis que permitem acesso limitado durante onboarding

-- SOLUTIONS: Permitir SELECT limitado durante onboarding (apenas informações básicas)
CREATE POLICY "onboarding_limited_solutions_access" ON public.solutions
  FOR SELECT 
  USING (
    -- Usuários com onboarding completo têm acesso total
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND onboarding_completed = true
    )
    OR
    -- Durante onboarding, permitir acesso limitado apenas para visualização
    (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND onboarding_completed = false
      )
      AND is_published = true  -- Apenas soluções publicadas
    )
  );

-- TOOLS: Permitir SELECT limitado durante onboarding
CREATE POLICY "onboarding_limited_tools_access" ON public.tools
  FOR SELECT 
  USING (
    -- Usuários com onboarding completo têm acesso total
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND onboarding_completed = true
    )
    OR
    -- Durante onboarding, permitir acesso limitado
    (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND onboarding_completed = false
      )
      AND is_active = true  -- Apenas ferramentas ativas
    )
  );

-- PROGRESS: Permitir operações no próprio progresso mesmo durante onboarding
CREATE POLICY "onboarding_own_progress_access" ON public.progress
  FOR ALL
  USING (
    user_id = auth.uid()  -- Sempre pode acessar próprio progresso
  )
  WITH CHECK (
    user_id = auth.uid()  -- Sempre pode modificar próprio progresso
  );

-- 3. Garantir que profiles sempre permite acesso ao próprio perfil
-- (Esta política já existe, mas vamos recriar para garantir)
DROP POLICY IF EXISTS "profiles_self_access_during_onboarding" ON public.profiles;
CREATE POLICY "profiles_self_access_during_onboarding" ON public.profiles
  FOR ALL
  USING (
    id = auth.uid()  -- Sempre pode acessar próprio perfil
    OR 
    public.is_user_admin(auth.uid())  -- Admins podem acessar outros perfis
  )
  WITH CHECK (
    id = auth.uid()  -- Sempre pode modificar próprio perfil
    OR 
    public.is_user_admin(auth.uid())  -- Admins podem modificar outros perfis
  );

-- 4. Log da correção
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  resource_id,
  details,
  severity
) VALUES (
  NULL,
  'system_event',
  'fix_onboarding_rls_policies',
  'security_system',
  jsonb_build_object(
    'action', 'replace_restrictive_policies_with_flexible_ones',
    'timestamp', NOW(),
    'reason', 'allow_onboarding_access_while_maintaining_security'
  ),
  'medium'
);

-- 5. Verificação das políticas aplicadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('solutions', 'tools', 'progress', 'profiles')
AND policyname LIKE '%onboarding%'
ORDER BY tablename, policyname;
