-- CORREÇÃO FINAL: Remover política conflitante que bloqueia acesso
-- A política learning_lessons_unified_access já está correta, mas a freemium_access está interferindo

-- 1. Remover política freemium que não verifica course_access_control
DROP POLICY IF EXISTS "learning_lessons_freemium_access" ON public.learning_lessons;

-- 2. Verificar se a política unified_access está ativa (já está criada corretamente)
-- A política learning_lessons_unified_access já inclui:
-- - Admin access
-- - Criador do curso  
-- - user_course_access
-- - course_access_control (CORREÇÃO APLICADA)

-- 3. Log da resolução final
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity
) VALUES (
  'rls_policy_cleanup',
  'remove_conflicting_freemium_policy',
  jsonb_build_object(
    'removed_policy', 'learning_lessons_freemium_access',
    'active_policy', 'learning_lessons_unified_access',
    'correction_status', 'APPLIED - course_access_control verification included',
    'next_step', 'Test with hands_on and membro_club users'
  ),
  'info'
);