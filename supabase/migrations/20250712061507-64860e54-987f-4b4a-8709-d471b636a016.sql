-- Migration: Final search_path fix for remaining functions (Part 3)
-- Simple approach: Add SET search_path = '' to all remaining functions without changing signatures

-- Drop and recreate get_courses_with_stats with correct return type
DROP FUNCTION IF EXISTS public.get_courses_with_stats();

-- Recreate with original signature but add search_path
CREATE OR REPLACE FUNCTION public.get_courses_with_stats()
 RETURNS TABLE(id uuid, title text, description text, cover_image_url text, slug text, published boolean, created_at timestamp with time zone, updated_at timestamp with time zone, order_index integer, created_by uuid, module_count integer, lesson_count integer, is_restricted boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT 
    lc.id,
    lc.title,
    lc.description,
    lc.cover_image_url,
    lc.slug,
    lc.published,
    lc.created_at,
    lc.updated_at,
    lc.order_index,
    lc.created_by,
    COALESCE(module_stats.module_count, 0)::integer as module_count,
    COALESCE(lesson_stats.lesson_count, 0)::integer as lesson_count,
    CASE WHEN access_control.course_id IS NOT NULL THEN true ELSE false END as is_restricted
  FROM public.learning_courses lc
  LEFT JOIN (
    SELECT course_id, COUNT(*)::integer as module_count
    FROM public.learning_modules
    GROUP BY course_id
  ) module_stats ON lc.id = module_stats.course_id
  LEFT JOIN (
    SELECT lm.course_id, COUNT(ll.*)::integer as lesson_count
    FROM public.learning_modules lm
    LEFT JOIN public.learning_lessons ll ON lm.id = ll.module_id
    GROUP BY lm.course_id
  ) lesson_stats ON lc.id = lesson_stats.course_id
  LEFT JOIN (
    SELECT DISTINCT course_id
    FROM public.course_access_control
  ) access_control ON lc.id = access_control.course_id
  ORDER BY lc.order_index NULLS LAST;
$function$;

-- Fix remaining critical functions with search_path

-- 1. check_solution_certificate_eligibility
CREATE OR REPLACE FUNCTION public.check_solution_certificate_eligibility(p_user_id uuid, p_solution_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  progress_record public.progress;
BEGIN
  -- Buscar progresso do usuário na solução
  SELECT * INTO progress_record
  FROM public.progress
  WHERE user_id = p_user_id AND solution_id = p_solution_id;
  
  -- Se não há progresso, não é elegível
  IF progress_record.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se a implementação está completa
  RETURN COALESCE(progress_record.is_completed, FALSE);
END;
$function$;

-- 2. get_user_security_permissions
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

-- 3. log_security_event
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

-- 4. create_solution_certificate_if_eligible
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

-- 5. create_learning_certificate_if_eligible
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

-- 6. process_referral
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
  -- Buscar indicação pelo token
  SELECT * INTO v_referral
  FROM public.referrals
  WHERE token = p_token
  AND expires_at > now()
  AND status = 'pending';

  -- Verificar se a indicação existe e é válida
  IF v_referral.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Indicação inválida ou expirada'
    );
  END IF;

  -- Atualizar status da indicação
  UPDATE public.referrals
  SET status = 'registered',
      completed_at = now()
  WHERE id = v_referral.id;

  -- Se tiver role_id, atribuir ao usuário
  IF v_referral.role_id IS NOT NULL THEN
    -- Atualizar o papel do usuário se aplicável
    UPDATE public.profiles
    SET role_id = v_referral.role_id
    WHERE id = p_user_id;
  END IF;

  -- Incrementar contador de indicações bem-sucedidas
  UPDATE public.profiles
  SET successful_referrals_count = successful_referrals_count + 1
  WHERE id = v_referral.referrer_id;

  -- Retornar resultado
  RETURN jsonb_build_object(
    'success', true,
    'referral_id', v_referral.id,
    'type', v_referral.type,
    'referrer_id', v_referral.referrer_id
  );
END;
$function$;

-- Continue with key remaining functions...

-- 7. generate_retroactive_certificates
CREATE OR REPLACE FUNCTION public.generate_retroactive_certificates()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  solution_certificates_created INTEGER := 0;
  learning_certificates_created INTEGER := 0;
  user_record RECORD;
  solution_record RECORD;
  course_record RECORD;
  certificate_id UUID;
BEGIN
  -- Gerar certificados de soluções
  FOR user_record IN 
    SELECT DISTINCT p.user_id, p.solution_id
    FROM public.progress p
    WHERE p.is_completed = true
      AND NOT EXISTS (
        SELECT 1 FROM public.solution_certificates sc 
        WHERE sc.user_id = p.user_id AND sc.solution_id = p.solution_id
      )
  LOOP
    BEGIN
      SELECT public.create_solution_certificate_if_eligible(
        user_record.user_id, 
        user_record.solution_id
      ) INTO certificate_id;
      
      IF certificate_id IS NOT NULL THEN
        solution_certificates_created := solution_certificates_created + 1;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Ignorar erros e continuar
        CONTINUE;
    END;
  END LOOP;

  -- Gerar certificados de cursos
  FOR course_record IN
    SELECT DISTINCT lm.course_id, lp.user_id
    FROM public.learning_progress lp
    JOIN public.learning_lessons ll ON lp.lesson_id = ll.id
    JOIN public.learning_modules lm ON ll.module_id = lm.id
    WHERE lp.progress_percentage = 100
      AND lp.completed_at IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.learning_certificates lc 
        WHERE lc.user_id = lp.user_id AND lc.course_id = lm.course_id
      )
    GROUP BY lm.course_id, lp.user_id
    HAVING COUNT(*) = (
      SELECT COUNT(*) 
      FROM public.learning_lessons ll2
      JOIN public.learning_modules lm2 ON ll2.module_id = lm2.id
      WHERE lm2.course_id = lm.course_id AND ll2.published = true
    )
  LOOP
    BEGIN
      SELECT public.create_learning_certificate_if_eligible(
        course_record.user_id, 
        course_record.course_id
      ) INTO certificate_id;
      
      IF certificate_id IS NOT NULL THEN
        learning_certificates_created := learning_certificates_created + 1;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Ignorar erros e continuar
        CONTINUE;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'solution_certificates_created', solution_certificates_created,
    'learning_certificates_created', learning_certificates_created,
    'total_created', solution_certificates_created + learning_certificates_created
  );
END;
$function$;

-- 8. check_referral
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
  -- Buscar indicação pelo token
  SELECT r.* INTO v_referral
  FROM public.referrals r
  WHERE r.token = p_token
  AND r.expires_at > now();
  
  -- Verificar se a indicação existe e é válida
  IF v_referral.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Indicação inválida ou expirada'
    );
  END IF;
  
  -- Buscar nome do indicador
  SELECT name INTO v_referrer_name
  FROM public.profiles
  WHERE id = v_referral.referrer_id;
  
  -- Retornar detalhes sem informações sensíveis
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

-- 9. handle_referral_status_change
CREATE OR REPLACE FUNCTION public.handle_referral_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Se o status mudou para 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Aqui poderia inserir em uma tabela de notificações ou eventos
    -- Exemplo:
    -- INSERT INTO notifications (user_id, message, type)
    -- VALUES (NEW.referrer_id, 'Sua indicação foi concluída com sucesso!', 'referral_completed');
    
    NULL; -- Placeholder
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 10. create_invite
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
  -- Obter o ID do usuário atual
  created_by_id := auth.uid();
  
  -- Verificar se o usuário tem permissão para criar convites
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
  
  -- Gerar token único
  new_token := public.generate_invite_token();
  
  -- Criar novo convite
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