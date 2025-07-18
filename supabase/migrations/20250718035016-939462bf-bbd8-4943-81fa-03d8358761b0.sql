-- CORREÇÃO CRÍTICA DE SEGURANÇA: Políticas RLS overly permissive (Parte 2)
-- Evita erro de policy já existente

-- 1. Remover política duplicada se existir
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

-- 2. Criar política correta para audit_logs
CREATE POLICY "Admins can read all audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 3. Remover políticas inseguras de user_roles
DROP POLICY IF EXISTS "Anyone can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Public read access to user roles" ON public.user_roles;

-- 4. Verificar outras tabelas sensíveis e corrigir
-- Tabela invite_backups deve ter acesso restrito
ALTER TABLE public.invite_backups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invite_backups_admin_only" ON public.invite_backups;

CREATE POLICY "invite_backups_admin_only"
ON public.invite_backups
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 5. Corrigir benefit_access_control
DROP POLICY IF EXISTS "benefit_access_secure_policy" ON public.benefit_access_control;

CREATE POLICY "benefit_access_admin_only"
ON public.benefit_access_control
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 6. Log final da correção
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity
) VALUES (
  'security_enhancement',
  'rls_policies_hardened_v2',
  jsonb_build_object(
    'changes', 'Fixed audit logs policy, restricted invite_backups and benefit_access_control',
    'status', 'completed',
    'timestamp', NOW()
  ),
  'high'
);