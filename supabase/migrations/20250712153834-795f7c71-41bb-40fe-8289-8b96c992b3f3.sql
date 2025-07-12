-- Migration: Fix search_path vulnerabilities - Batch 1 (excluding problematic functions)
-- Adding SET search_path = '' to critical security functions

-- 1. Fix log_permission_change function
CREATE OR REPLACE FUNCTION public.log_permission_change(user_id uuid, action_type character varying, target_user_id uuid DEFAULT NULL::uuid, role_id uuid DEFAULT NULL::uuid, role_name character varying DEFAULT NULL::character varying, permission_id uuid DEFAULT NULL::uuid, permission_code character varying DEFAULT NULL::character varying, old_value text DEFAULT NULL::text, new_value text DEFAULT NULL::text, ip_address text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.permission_audit_logs
    (user_id, target_user_id, action_type, role_id, role_name, permission_id, 
     permission_code, old_value, new_value, ip_address)
  VALUES
    (user_id, target_user_id, action_type, role_id, role_name, permission_id, 
     permission_code, old_value, new_value, ip_address)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- 2. Fix check_solution_certificate_eligibility function
CREATE OR REPLACE FUNCTION public.check_solution_certificate_eligibility(p_user_id uuid, p_solution_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  progress_record public.progress;
BEGIN
  SELECT * INTO progress_record
  FROM public.progress
  WHERE user_id = p_user_id AND solution_id = p_solution_id;
  
  IF progress_record.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN COALESCE(progress_record.is_completed, FALSE);
END;
$function$;

-- 3. Fix get_user_security_permissions function
CREATE OR REPLACE FUNCTION public.get_user_security_permissions(user_id uuid)
 RETURNS text[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  user_role TEXT;
  permissions TEXT[];
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = user_id;
  
  CASE user_role
    WHEN 'admin' THEN
      permissions := ARRAY['read', 'write', 'delete', 'admin', 'manage_users'];
    WHEN 'formacao' THEN
      permissions := ARRAY['read', 'write', 'manage_content'];
    ELSE
      permissions := ARRAY['read'];
  END CASE;
  
  RETURN permissions;
END;
$function$;

-- 4. Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(p_action_type text, p_resource_type text, p_resource_id text DEFAULT NULL::text, p_old_values text DEFAULT NULL::text, p_new_values text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO audit_logs (
    event_type,
    action,
    user_id,
    resource_id,
    details
  ) VALUES (
    'security_event',
    p_action_type,
    auth.uid(),
    p_resource_id,
    jsonb_build_object(
      'resource_type', p_resource_type,
      'old_values', p_old_values,
      'new_values', p_new_values,
      'timestamp', NOW()
    )
  );
END;
$function$;

-- 5. Fix create_solution_certificate_if_eligible function
CREATE OR REPLACE FUNCTION public.create_solution_certificate_if_eligible(p_user_id uuid, p_solution_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  certificate_id UUID;
  progress_record public.progress;
BEGIN
  SELECT id INTO certificate_id
  FROM public.solution_certificates
  WHERE user_id = p_user_id AND solution_id = p_solution_id;
  
  IF certificate_id IS NOT NULL THEN
    RAISE EXCEPTION 'Usuário já possui certificado para esta solução';
  END IF;

  IF NOT public.check_solution_certificate_eligibility(p_user_id, p_solution_id) THEN
    RAISE EXCEPTION 'Usuário não é elegível para certificado desta solução';
  END IF;

  SELECT * INTO progress_record
  FROM public.progress
  WHERE user_id = p_user_id AND solution_id = p_solution_id;

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

-- 6. Fix create_learning_certificate_if_eligible function
CREATE OR REPLACE FUNCTION public.create_learning_certificate_if_eligible(p_user_id uuid, p_course_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  certificate_id UUID;
  completion_date TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT id INTO certificate_id
  FROM public.learning_certificates
  WHERE user_id = p_user_id AND course_id = p_course_id;
  
  IF certificate_id IS NOT NULL THEN
    RAISE EXCEPTION 'Usuário já possui certificado para este curso';
  END IF;

  SELECT MAX(completed_at) INTO completion_date
  FROM public.learning_progress lp
  JOIN public.learning_lessons ll ON lp.lesson_id = ll.id
  JOIN public.learning_modules lm ON ll.module_id = lm.id
  WHERE lp.user_id = p_user_id 
    AND lm.course_id = p_course_id 
    AND lp.progress_percentage = 100
    AND lp.completed_at IS NOT NULL;

  IF completion_date IS NULL THEN
    RAISE EXCEPTION 'Usuário não completou nenhuma aula do curso';
  END IF;

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

-- 7. Fix process_referral function
CREATE OR REPLACE FUNCTION public.process_referral(p_token text, p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  v_referral public.referrals;
  v_result JSONB;
BEGIN
  SELECT * INTO v_referral
  FROM public.referrals
  WHERE token = p_token
  AND expires_at > now()
  AND status = 'pending';

  IF v_referral.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Indicação inválida ou expirada'
    );
  END IF;

  UPDATE public.referrals
  SET status = 'registered',
      completed_at = now()
  WHERE id = v_referral.id;

  IF v_referral.role_id IS NOT NULL THEN
    UPDATE public.profiles
    SET role_id = v_referral.role_id
    WHERE id = p_user_id;
  END IF;

  UPDATE public.profiles
  SET successful_referrals_count = successful_referrals_count + 1
  WHERE id = v_referral.referrer_id;

  RETURN jsonb_build_object(
    'success', true,
    'referral_id', v_referral.id,
    'type', v_referral.type,
    'referrer_id', v_referral.referrer_id
  );
END;
$function$;

-- 8. Fix check_referral function
CREATE OR REPLACE FUNCTION public.check_referral(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  v_referral public.referrals;
  v_result JSONB;
  v_referrer_name TEXT;
BEGIN
  SELECT r.* INTO v_referral
  FROM public.referrals r
  WHERE r.token = p_token
  AND r.expires_at > now();
  
  IF v_referral.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Indicação inválida ou expirada'
    );
  END IF;
  
  SELECT name INTO v_referrer_name
  FROM public.profiles
  WHERE id = v_referral.referrer_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'referral_id', v_referral.id,
    'type', v_referral.type,
    'referrer_name', v_referrer_name,
    'status', v_referral.status,
    'expires_at', v_referral.expires_at
  );
END;
$function$;

-- 9. Fix handle_referral_status_change function
CREATE OR REPLACE FUNCTION public.handle_referral_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NULL;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 10. Fix create_invite function  
CREATE OR REPLACE FUNCTION public.create_invite(p_email text, p_role_id uuid, p_expires_in interval DEFAULT '7 days'::interval, p_notes text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  new_token text;
  new_invite_id uuid;
  created_by_id uuid;
BEGIN
  created_by_id := auth.uid();
  
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = created_by_id AND (ur.name = 'admin')
  ) THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Você não tem permissão para criar convites'
    );
  END IF;
  
  new_token := public.generate_invite_token();
  
  INSERT INTO public.invites (
    email,
    role_id,
    token,
    expires_at,
    created_by,
    notes
  )
  VALUES (
    p_email,
    p_role_id,
    new_token,
    now() + p_expires_in,
    created_by_id,
    p_notes
  )
  RETURNING id INTO new_invite_id;
  
  RETURN json_build_object(
    'status', 'success',
    'message', 'Convite criado com sucesso',
    'invite_id', new_invite_id,
    'token', new_token,
    'expires_at', (now() + p_expires_in)
  );
END;
$function$;