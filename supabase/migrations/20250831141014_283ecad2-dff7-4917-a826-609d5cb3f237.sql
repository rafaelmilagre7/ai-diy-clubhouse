-- CORREÇÃO URGENTE: Política RLS learning_lessons
-- Problema: learning_lessons_authenticated_secure não verifica course_access_control

-- 1. Remover política problemática atual
DROP POLICY IF EXISTS "learning_lessons_authenticated_secure" ON public.learning_lessons;

-- 2. Criar nova política que inclui course_access_control
CREATE POLICY "learning_lessons_complete_access_check" 
ON public.learning_lessons 
FOR SELECT 
TO authenticated
USING (
  -- Admin sempre tem acesso
  (EXISTS (
    SELECT 1 FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  ))
  OR
  -- Criador do curso tem acesso
  (module_id IN (
    SELECT lm.id FROM public.learning_modules lm
    INNER JOIN public.learning_courses lc ON lm.course_id = lc.id
    WHERE lc.created_by = auth.uid()
  ))
  OR
  -- Usuário com acesso individual via user_course_access
  (module_id IN (
    SELECT lm.id FROM public.learning_modules lm
    INNER JOIN public.user_course_access uca ON lm.course_id = uca.course_id
    WHERE uca.user_id = auth.uid()
  ))
  OR
  -- NOVA VERIFICAÇÃO: Role-based access via course_access_control
  (module_id IN (
    SELECT lm.id FROM public.learning_modules lm
    INNER JOIN public.course_access_control cac ON lm.course_id = cac.course_id
    INNER JOIN public.profiles p ON p.id = auth.uid()
    WHERE cac.role_id = p.role_id
  ))
);

-- 3. Adicionar comentário explicativo
COMMENT ON POLICY "learning_lessons_complete_access_check" ON public.learning_lessons IS 
'Política RLS completa que verifica: admin, criador, user_course_access E course_access_control para resolver bloqueio de usuários hands_on e membro_club';

-- 4. Log da correção para auditoria
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity
) VALUES (
  'rls_policy_update',
  'fix_learning_lessons_access',
  jsonb_build_object(
    'old_policy', 'learning_lessons_authenticated_secure',
    'new_policy', 'learning_lessons_complete_access_check',
    'reason', 'Include course_access_control verification for hands_on and membro_club users',
    'affected_tables', ARRAY['learning_lessons'],
    'impact', 'Restores access for hundreds of users with proper role permissions'
  ),
  'critical'
);