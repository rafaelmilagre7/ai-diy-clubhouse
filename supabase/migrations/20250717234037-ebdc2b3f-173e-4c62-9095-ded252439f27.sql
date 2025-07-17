-- FASE 3: CORREÇÕES CRÍTICAS DE SEGURANÇA - VERSÃO FINAL
-- ===================================================

-- 1. Corrigir função create_learning_certificate_if_eligible
CREATE OR REPLACE FUNCTION public.create_learning_certificate_if_eligible(p_user_id uuid, p_course_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  certificate_id UUID;
  completion_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Verificar se já existe certificado
  SELECT id INTO certificate_id
  FROM public.learning_certificates
  WHERE user_id = p_user_id AND course_id = p_course_id;
  
  IF certificate_id IS NOT NULL THEN
    RAISE EXCEPTION 'Usuário já possui certificado para este curso';
  END IF;

  -- Verificar se todas as aulas do curso foram completadas
  SELECT MAX(completed_at) INTO completion_date
  FROM public.learning_progress lp
  JOIN public.learning_lessons ll ON lp.lesson_id = ll.id
  JOIN public.learning_modules lm ON ll.module_id = lm.id
  WHERE lp.user_id = p_user_id 
    AND lm.course_id = p_course_id 
    AND lp.progress_percentage = 100
    AND lp.completed_at IS NOT NULL;

  -- Verificar se há pelo menos uma aula completada
  IF completion_date IS NULL THEN
    RAISE EXCEPTION 'Usuário não completou nenhuma aula do curso';
  END IF;

  -- Verificar se todas as aulas foram completadas
  IF EXISTS (
    SELECT 1
    FROM public.learning_lessons ll
    JOIN public.learning_modules lm ON ll.module_id = lm.id
    WHERE lm.course_id = p_course_id
      AND ll.published = true
      AND NOT EXISTS (
        SELECT 1 
        FROM public.learning_progress lp 
        WHERE lp.lesson_id = ll.id 
          AND lp.user_id = p_user_id 
          AND lp.progress_percentage = 100
          AND lp.completed_at IS NOT NULL
      )
  ) THEN
    RAISE EXCEPTION 'Usuário não completou todas as aulas do curso';
  END IF;

  -- Criar certificado
  INSERT INTO public.learning_certificates (
    user_id,
    course_id,
    validation_code,
    issued_at
  )
  VALUES (
    p_user_id,
    p_course_id,
    public.generate_certificate_validation_code(),
    COALESCE(completion_date, now())
  )
  RETURNING id INTO certificate_id;

  RETURN certificate_id;
END;
$function$;

-- 2. Corrigir função create_solution_certificate_if_eligible
CREATE OR REPLACE FUNCTION public.create_solution_certificate_if_eligible(p_user_id uuid, p_solution_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  certificate_id UUID;
  progress_record public.progress;
BEGIN
  -- Verificar se já existe certificado
  SELECT id INTO certificate_id
  FROM public.solution_certificates
  WHERE user_id = p_user_id AND solution_id = p_solution_id;
  
  IF certificate_id IS NOT NULL THEN
    RAISE EXCEPTION 'Usuário já possui certificado para esta solução';
  END IF;

  -- Verificar elegibilidade
  IF NOT public.check_solution_certificate_eligibility(p_user_id, p_solution_id) THEN
    RAISE EXCEPTION 'Usuário não é elegível para certificado desta solução';
  END IF;

  -- Buscar dados do progresso para data de implementação
  SELECT * INTO progress_record
  FROM public.progress
  WHERE user_id = p_user_id AND solution_id = p_solution_id;

  -- Criar certificado
  INSERT INTO public.solution_certificates (
    user_id,
    solution_id,
    implementation_date,
    validation_code,
    issued_at
  )
  VALUES (
    p_user_id,
    p_solution_id,
    COALESCE(progress_record.completed_at, progress_record.last_activity, now()),
    public.generate_certificate_validation_code(),
    now()
  )
  RETURNING id INTO certificate_id;

  RETURN certificate_id;
END;
$function$;

-- 3. Corrigir função diagnose_auth_state
CREATE OR REPLACE FUNCTION public.diagnose_auth_state(target_user_id uuid DEFAULT auth.uid())
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  user_profile public.profiles;
  user_role public.user_roles;
  auth_user_exists boolean;
  onboarding_status jsonb;
  invite_history jsonb;
  result jsonb;
BEGIN
  -- Verificar se o usuário existe no auth.users
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE id = target_user_id
  ) INTO auth_user_exists;

  -- Buscar perfil
  SELECT * INTO user_profile FROM public.profiles WHERE id = target_user_id;
  
  -- Buscar role se perfil existe
  IF user_profile.id IS NOT NULL THEN
    SELECT * INTO user_role FROM public.user_roles WHERE id = user_profile.role_id;
  END IF;

  -- Buscar status de onboarding
  SELECT jsonb_build_object(
    'onboarding_final_exists', EXISTS(SELECT 1 FROM public.onboarding_final WHERE user_id = target_user_id),
    'profile_onboarding_completed', user_profile.onboarding_completed
  ) INTO onboarding_status;

  -- Buscar histórico de convites
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', i.id,
      'email', i.email,
      'token', left(i.token, 8) || '***',
      'used_at', i.used_at,
      'expires_at', i.expires_at,
      'role_name', ur.name
    )
  ) INTO invite_history
  FROM public.invites i
  LEFT JOIN public.user_roles ur ON i.role_id = ur.id
  WHERE i.email = user_profile.email;

  -- Montar resultado
  result := jsonb_build_object(
    'user_id', target_user_id,
    'auth_user_exists', auth_user_exists,
    'profile', CASE 
      WHEN user_profile.id IS NOT NULL THEN 
        jsonb_build_object(
          'exists', true,
          'email', user_profile.email,
          'name', user_profile.name,
          'role_id', user_profile.role_id,
          'onboarding_completed', user_profile.onboarding_completed,
          'created_at', user_profile.created_at
        )
      ELSE jsonb_build_object('exists', false)
    END,
    'role', CASE 
      WHEN user_role.id IS NOT NULL THEN 
        jsonb_build_object(
          'id', user_role.id,
          'name', user_role.name,
          'description', user_role.description
        )
      ELSE null
    END,
    'onboarding_status', onboarding_status,
    'invite_history', COALESCE(invite_history, '[]'::jsonb),
    'diagnosis_timestamp', now()
  );

  RETURN result;
END;
$function$;