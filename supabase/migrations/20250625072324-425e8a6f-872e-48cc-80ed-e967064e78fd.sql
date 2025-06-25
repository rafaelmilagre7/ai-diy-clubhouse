
-- CORREÇÃO CRÍTICA: Garantir onboarding obrigatório para TODOS os usuários
-- Parte 1: Corrigir dados inconsistentes

-- 1. Atualizar todos os perfis com onboarding_completed NULL para FALSE
UPDATE public.profiles 
SET onboarding_completed = false 
WHERE onboarding_completed IS NULL;

-- 2. Resetar onboarding_completed para FALSE para TODOS os usuários (incluindo admins)
-- Isso força TODOS a refazerem o onboarding com as novas validações
UPDATE public.profiles 
SET onboarding_completed = false,
    onboarding_completed_at = NULL;

-- 3. Criar política RLS para bloquear acesso a dados sensíveis sem onboarding completo
CREATE POLICY "block_incomplete_onboarding_access" ON public.solutions
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND onboarding_completed = true
    )
  );

-- 4. Aplicar mesma política para outras tabelas críticas
CREATE POLICY "block_incomplete_onboarding_tools" ON public.tools
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND onboarding_completed = true
    )
  );

CREATE POLICY "block_incomplete_onboarding_progress" ON public.progress
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND onboarding_completed = true
    )
  );

-- 5. Log da operação crítica
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
  'mandatory_onboarding_enforcement',
  'security_system',
  jsonb_build_object(
    'action', 'reset_all_onboarding_status',
    'timestamp', NOW(),
    'affected_users', (SELECT COUNT(*) FROM public.profiles),
    'security_level', 'critical'
  ),
  'high'
);

-- 6. Verificação final
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN onboarding_completed = true THEN 1 END) as completed_onboarding,
  COUNT(CASE WHEN onboarding_completed = false THEN 1 END) as pending_onboarding,
  COUNT(CASE WHEN onboarding_completed IS NULL THEN 1 END) as null_onboarding
FROM public.profiles;
