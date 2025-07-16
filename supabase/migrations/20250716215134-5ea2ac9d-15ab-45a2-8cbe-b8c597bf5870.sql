-- FASE 6: Correção de Políticas RLS Críticas

-- 1. CRÍTICO: Corrigir política extremamente perigosa em rate_limits
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;

-- Criar política segura para rate_limits (apenas para admins)
CREATE POLICY "rate_limits_admin_only" 
ON public.rate_limits 
FOR ALL 
USING (public.is_user_admin(auth.uid()));

-- 2. CRÍTICO: Corrigir políticas de acesso público que deveriam ser restritas
-- Corrigir forum_reactions (permitir apenas usuários autenticados)
DROP POLICY IF EXISTS "Anyone can view forum reactions" ON public.forum_reactions;

CREATE POLICY "forum_reactions_authenticated_select" 
ON public.forum_reactions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 3. CRÍTICO: Corrigir user_roles (extremamente sensível)
DROP POLICY IF EXISTS "Everyone can view role definitions" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view user roles" ON public.user_roles;

CREATE POLICY "user_roles_authenticated_select" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 4. CRÍTICO: Corrigir tools (muito permissivo)
DROP POLICY IF EXISTS "All can view tools" ON public.tools;
DROP POLICY IF EXISTS "Ferramentas visíveis para todos os usuários autenticados" ON public.tools;
DROP POLICY IF EXISTS "tools_select_policy" ON public.tools;

-- Manter apenas as políticas mais restritivas para tools
CREATE POLICY "tools_authenticated_select" 
ON public.tools 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND onboarding_completed = true
  ) OR public.is_user_admin(auth.uid()))
);

-- 5. Log da FASE 6
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'security_audit',
  'phase_6_critical_rls_fixes',
  jsonb_build_object(
    'phase', '6_CRITICAL_RLS_FIXES',
    'status', 'EXECUTADA',
    'critical_fixes', ARRAY[
      'rate_limits: removida política extremamente perigosa',
      'forum_reactions: restrito para usuários autenticados',
      'user_roles: removidas políticas públicas',
      'tools: consolidadas políticas restritivas'
    ],
    'security_level', 'CRÍTICO',
    'timestamp', now()
  ),
  auth.uid()
);

SELECT 'FASE 6 EXECUTADA: Políticas RLS críticas corrigidas' as status;