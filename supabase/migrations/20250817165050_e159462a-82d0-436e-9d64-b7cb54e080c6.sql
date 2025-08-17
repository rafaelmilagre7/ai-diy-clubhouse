-- Correção de segurança: Restringir acesso à tabela solution_tools
-- Remove política pública perigosa que permite acesso irrestrito
DROP POLICY IF EXISTS "Public can view solution_tools" ON public.solution_tools;

-- Cria nova política que permite apenas usuários autenticados visualizarem
CREATE POLICY "Authenticated users can view solution tools"
ON public.solution_tools
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Log da correção de segurança
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_fix',
  'solution_tools_access_restricted',
  jsonb_build_object(
    'description', 'Removed public access to solution_tools table',
    'old_policy', 'Public can view solution_tools (unrestricted)',
    'new_policy', 'Authenticated users only',
    'security_risk', 'Business solution data exposure prevented'
  ),
  'high'
);