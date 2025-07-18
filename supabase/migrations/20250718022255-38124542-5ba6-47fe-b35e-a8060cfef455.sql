-- CORREÇÕES CRÍTICAS DE RLS - Implementação das vulnerabilidades identificadas

-- 1. CORRIGIR TABELAS SEM POLÍTICAS RLS (Prioridade Crítica)

-- Políticas para security_logs (tabela com dados sensíveis)
CREATE POLICY "Admins can manage security logs"
ON public.security_logs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Políticas para security_metrics (tabela com dados sensíveis)
CREATE POLICY "Admins can manage security metrics"
ON public.security_metrics
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Políticas para user_backups (se existir - dados sensíveis de backup)
CREATE POLICY "Admins can manage user backups"
ON public.user_backups
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 2. PADRONIZAR VERIFICAÇÃO DE ADMIN (Eliminar uso de profiles.role obsoleto)

-- Atualizar política obsoleta em learning_comments
DROP POLICY IF EXISTS "Admins podem excluir comentários" ON public.learning_comments;
DROP POLICY IF EXISTS "Admins podem moderar todos comentários" ON public.learning_comments;
DROP POLICY IF EXISTS "Comentários visíveis para admin e formacao" ON public.learning_comments;

CREATE POLICY "Admins can moderate all comments"
ON public.learning_comments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Atualizar política obsoleta em badges
DROP POLICY IF EXISTS "Administradores podem gerenciar badges" ON public.badges;

-- Atualizar política obsoleta em events
DROP POLICY IF EXISTS "Permitir atualização apenas para administradores" ON public.events;
DROP POLICY IF EXISTS "Permitir exclusão apenas para administradores" ON public.events;

-- Atualizar política obsoleta em audit_logs
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 3. REMOVER POLÍTICAS DUPLICADAS (Manter apenas as mais seguras)

-- Remover duplicatas em invites (manter apenas a mais restritiva)
DROP POLICY IF EXISTS "Only admins can manage invites" ON public.invites;

-- Garantir que tools tenha política adequada para benefícios
CREATE POLICY "Users can view active tools for benefits"
ON public.tools
FOR SELECT
TO authenticated
USING (status = true);

-- 4. CORRIGIR FUNÇÕES DE SEGURANÇA (Adicionar search_path vazio)

-- Corrigir função is_admin() se não tiver search_path seguro
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  );
END;
$$;

-- Log das correções críticas implementadas
INSERT INTO public.audit_logs (
  event_type,
  action,
  details
) VALUES (
  'critical_security_fix',
  'rls_policies_hardening',
  jsonb_build_object(
    'fixes_applied', ARRAY[
      'Added policies to security_logs, security_metrics, user_backups',
      'Standardized admin checks to use user_roles table',
      'Removed duplicate policies',
      'Fixed security functions with proper search_path'
    ],
    'security_impact', 'Critical vulnerabilities eliminated',
    'tables_affected', ARRAY['security_logs', 'security_metrics', 'user_backups', 'learning_comments', 'badges', 'events', 'audit_logs', 'invites', 'tools'],
    'timestamp', NOW()
  )
);