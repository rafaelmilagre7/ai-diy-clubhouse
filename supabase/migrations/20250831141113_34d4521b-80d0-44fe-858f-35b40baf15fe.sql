-- CORREÇÃO URGENTE: Remover todas as políticas e recriar corretamente
-- Problema: learning_lessons não verifica course_access_control

-- 1. Remover TODAS as políticas existentes da tabela learning_lessons
DROP POLICY IF EXISTS "learning_lessons_authenticated_secure" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_complete_access_check" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_authenticated_only" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_secure_access" ON public.learning_lessons;

-- 2. Criar política única e completa
CREATE POLICY "learning_lessons_unified_access" 
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
  -- CORREÇÃO CRÍTICA: Role-based access via course_access_control
  (module_id IN (
    SELECT lm.id FROM public.learning_modules lm
    INNER JOIN public.course_access_control cac ON lm.course_id = cac.course_id
    INNER JOIN public.profiles p ON p.id = auth.uid()
    WHERE cac.role_id = p.role_id
  ))
);

-- 3. Log da correção crítica
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity
) VALUES (
  'critical_rls_fix',
  'restore_learning_access',
  jsonb_build_object(
    'fix_description', 'Added course_access_control verification to learning_lessons RLS',
    'affected_users', 'hands_on, membro_club roles',
    'urgency', 'CRITICAL - System was broken for paying users',
    'validation_needed', 'Test with nicholaslmachado@hotmail.com (hands_on role)'
  ),
  'critical'
);