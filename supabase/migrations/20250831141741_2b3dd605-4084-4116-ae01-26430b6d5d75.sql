-- CORREÇÃO: Atualizar política RLS dos learning_modules para incluir course_access_control
-- Problema: learning_modules não verifica course_access_control, bloqueando usuários hands_on/membro_club

-- 1. Remover política atual que não inclui course_access_control
DROP POLICY IF EXISTS "learning_modules_authenticated_secure" ON public.learning_modules;

-- 2. Criar nova política que inclui course_access_control
CREATE POLICY "learning_modules_unified_access" ON public.learning_modules
FOR SELECT TO authenticated
USING (
  -- Admin tem acesso total
  (EXISTS (
    SELECT 1 FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  ))
  OR
  -- Criador do curso tem acesso
  (created_by = auth.uid())
  OR
  -- Verificar acesso via user_course_access
  (EXISTS (
    SELECT 1 FROM public.user_course_access uca
    WHERE uca.user_id = auth.uid() AND uca.course_id = learning_modules.course_id
  ))
  OR
  -- CORREÇÃO: Verificar acesso via course_access_control (papel do usuário)
  (EXISTS (
    SELECT 1 FROM public.profiles p
    INNER JOIN public.course_access_control cac ON p.role_id = cac.role_id
    WHERE p.id = auth.uid() AND cac.course_id = learning_modules.course_id
  ))
);

-- 3. Log da correção aplicada
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity
) VALUES (
  'rls_policy_fix',
  'update_learning_modules_access',
  jsonb_build_object(
    'table', 'learning_modules',
    'old_policy', 'learning_modules_authenticated_secure',
    'new_policy', 'learning_modules_unified_access',
    'correction', 'Added course_access_control verification',
    'affected_roles', '["hands_on", "membro_club"]',
    'expected_result', 'Users with hands_on/membro_club roles should now see modules and lessons in Formação'
  ),
  'info'
);