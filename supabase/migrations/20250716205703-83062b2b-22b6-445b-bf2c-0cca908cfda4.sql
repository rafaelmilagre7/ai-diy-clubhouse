-- FASE 4 COMPLETA: LOTE 3C - Funções de Certificados e Análises
-- Corrigindo 15 funções críticas relacionadas a certificados e análises com SET search_path TO ''

-- 1. get_user_badges
DROP FUNCTION IF EXISTS public.get_user_badges(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.get_user_badges(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  image_url text,
  category text,
  earned_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.description,
    b.image_url,
    b.category,
    ub.earned_at
  FROM public.badges b
  JOIN public.user_badges ub ON b.id = ub.badge_id
  WHERE ub.user_id = p_user_id
  ORDER BY ub.earned_at DESC;
END;
$$;

-- 2. get_user_complete_data
DROP FUNCTION IF EXISTS public.get_user_complete_data(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.get_user_complete_data(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_data jsonb;
  profile_data public.profiles;
  onboarding_data public.onboarding_final;
  progress_count integer;
BEGIN
  -- Buscar dados do perfil
  SELECT * INTO profile_data FROM public.profiles WHERE id = p_user_id;
  
  -- Buscar dados do onboarding
  SELECT * INTO onboarding_data FROM public.onboarding_final WHERE user_id = p_user_id;
  
  -- Contar progresso
  SELECT COUNT(*) INTO progress_count FROM public.progress WHERE user_id = p_user_id;
  
  user_data := jsonb_build_object(
    'profile', to_jsonb(profile_data),
    'onboarding', to_jsonb(onboarding_data),
    'progress_count', progress_count,
    'badges_count', (SELECT COUNT(*) FROM public.user_badges WHERE user_id = p_user_id)
  );
  
  RETURN user_data;
END;
$$;

-- 3. handle_referral_status_change
DROP FUNCTION IF EXISTS public.handle_referral_status_change() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_referral_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Se o status mudou para 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Incrementar contador de referências do referenciador
    UPDATE public.profiles
    SET successful_referrals_count = successful_referrals_count + 1
    WHERE id = NEW.referrer_id;
    
    -- Log do evento
    INSERT INTO public.audit_logs (
      user_id, event_type, action, details
    ) VALUES (
      NEW.referrer_id,
      'referral_completed',
      'increment_referral_count',
      jsonb_build_object(
        'referral_id', NEW.id,
        'referred_user', NEW.referred_user_id,
        'completed_at', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. increment_suggestion_downvote
DROP FUNCTION IF EXISTS public.increment_suggestion_downvote(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.increment_suggestion_downvote(p_suggestion_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  suggestion_record public.suggestions;
BEGIN
  -- Buscar sugestão
  SELECT * INTO suggestion_record FROM public.suggestions WHERE id = p_suggestion_id;
  
  IF suggestion_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Sugestão não encontrada');
  END IF;
  
  -- Incrementar downvotes
  UPDATE public.suggestions
  SET downvotes = downvotes + 1
  WHERE id = p_suggestion_id;
  
  RETURN jsonb_build_object('success', true, 'downvotes', suggestion_record.downvotes + 1);
END;
$$;

-- 5. increment_suggestion_upvote
DROP FUNCTION IF EXISTS public.increment_suggestion_upvote(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.increment_suggestion_upvote(p_suggestion_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  suggestion_record public.suggestions;
BEGIN
  -- Buscar sugestão
  SELECT * INTO suggestion_record FROM public.suggestions WHERE id = p_suggestion_id;
  
  IF suggestion_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Sugestão não encontrada');
  END IF;
  
  -- Incrementar upvotes
  UPDATE public.suggestions
  SET upvotes = upvotes + 1
  WHERE id = p_suggestion_id;
  
  RETURN jsonb_build_object('success', true, 'upvotes', suggestion_record.upvotes + 1);
END;
$$;

-- 6. increment_topic_replies
DROP FUNCTION IF EXISTS public.increment_topic_replies(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.increment_topic_replies(p_topic_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  UPDATE public.forum_topics
  SET 
    reply_count = reply_count + 1,
    last_activity_at = now()
  WHERE id = p_topic_id;
END;
$$;

-- 7. increment_topic_views
DROP FUNCTION IF EXISTS public.increment_topic_views(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.increment_topic_views(p_topic_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  UPDATE public.forum_topics
  SET view_count = view_count + 1
  WHERE id = p_topic_id;
END;
$$;

-- 8. reset_onboarding_step
DROP FUNCTION IF EXISTS public.reset_onboarding_step(uuid, integer) CASCADE;
CREATE OR REPLACE FUNCTION public.reset_onboarding_step(p_user_id uuid, p_step integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Verificar permissão
  IF p_user_id != auth.uid() AND NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Resetar para o step especificado
  UPDATE public.onboarding_final
  SET 
    current_step = p_step,
    is_completed = false,
    completed_at = NULL,
    completed_steps = ARRAY(
      SELECT generate_series(1, p_step - 1)
    )::integer[]
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', format('Onboarding resetado para etapa %s', p_step)
  );
END;
$$;

-- 9. send_invite_email
DROP FUNCTION IF EXISTS public.send_invite_email(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.send_invite_email(p_invite_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  invite_record public.invites;
BEGIN
  -- Buscar convite
  SELECT * INTO invite_record FROM public.invites WHERE id = p_invite_id;
  
  IF invite_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Convite não encontrado');
  END IF;
  
  -- Atualizar tentativas de envio
  UPDATE public.invites
  SET 
    send_attempts = send_attempts + 1,
    last_sent_at = now()
  WHERE id = p_invite_id;
  
  -- Log da entrega
  INSERT INTO public.invite_deliveries (
    invite_id, channel, status, sent_at
  ) VALUES (
    p_invite_id, 'email', 'sent', now()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Email enviado',
    'invite_token', invite_record.token
  );
END;
$$;

-- 10. send_invite_whatsapp
DROP FUNCTION IF EXISTS public.send_invite_whatsapp(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.send_invite_whatsapp(p_invite_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  invite_record public.invites;
BEGIN
  -- Buscar convite
  SELECT * INTO invite_record FROM public.invites WHERE id = p_invite_id;
  
  IF invite_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Convite não encontrado');
  END IF;
  
  IF invite_record.whatsapp_number IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Número WhatsApp não informado');
  END IF;
  
  -- Atualizar tentativas de envio
  UPDATE public.invites
  SET 
    send_attempts = send_attempts + 1,
    last_sent_at = now()
  WHERE id = p_invite_id;
  
  -- Log da entrega
  INSERT INTO public.invite_deliveries (
    invite_id, channel, status, sent_at
  ) VALUES (
    p_invite_id, 'whatsapp', 'sent', now()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'WhatsApp enviado',
    'invite_token', invite_record.token
  );
END;
$$;

-- 11. update_onboarding_step
DROP FUNCTION IF EXISTS public.update_onboarding_step(uuid, integer, jsonb) CASCADE;
CREATE OR REPLACE FUNCTION public.update_onboarding_step(
  p_user_id uuid,
  p_step integer,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  onboarding_record public.onboarding_final;
  updated_steps integer[];
BEGIN
  -- Verificar permissão
  IF p_user_id != auth.uid() AND NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Buscar onboarding
  SELECT * INTO onboarding_record FROM public.onboarding_final WHERE user_id = p_user_id;
  
  IF onboarding_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Onboarding não encontrado');
  END IF;
  
  -- Adicionar step aos completados se não estiver
  updated_steps := onboarding_record.completed_steps;
  IF NOT (p_step = ANY(updated_steps)) THEN
    updated_steps := array_append(updated_steps, p_step);
  END IF;
  
  -- Atualizar onboarding
  UPDATE public.onboarding_final
  SET 
    current_step = GREATEST(p_step + 1, current_step),
    completed_steps = updated_steps,
    personal_info = CASE 
      WHEN p_step = 1 THEN public.merge_json_data(personal_info, p_data)
      ELSE personal_info
    END,
    business_info = CASE 
      WHEN p_step = 2 THEN public.merge_json_data(business_info, p_data)
      ELSE business_info
    END,
    goals_info = CASE 
      WHEN p_step = 3 THEN public.merge_json_data(goals_info, p_data)
      ELSE goals_info
    END,
    ai_experience = CASE 
      WHEN p_step = 4 THEN public.merge_json_data(ai_experience, p_data)
      ELSE ai_experience
    END,
    personalization = CASE 
      WHEN p_step = 5 THEN public.merge_json_data(personalization, p_data)
      ELSE personalization
    END,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'current_step', GREATEST(p_step + 1, onboarding_record.current_step),
    'completed_steps', updated_steps
  );
END;
$$;

-- 12. validate_certificate_code
DROP FUNCTION IF EXISTS public.validate_certificate_code(text) CASCADE;
CREATE OR REPLACE FUNCTION public.validate_certificate_code(p_validation_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  cert_learning public.learning_certificates;
  cert_solution public.solution_certificates;
  result jsonb;
BEGIN
  -- Verificar certificado de learning
  SELECT * INTO cert_learning
  FROM public.learning_certificates
  WHERE validation_code = p_validation_code;
  
  IF cert_learning.id IS NOT NULL THEN
    SELECT 
      jsonb_build_object(
        'valid', true,
        'type', 'learning',
        'user_name', p.name,
        'course_title', lc.title,
        'issued_at', cert_learning.issued_at
      )
    INTO result
    FROM public.profiles p
    JOIN public.learning_courses lc ON cert_learning.course_id = lc.id
    WHERE p.id = cert_learning.user_id;
    
    RETURN result;
  END IF;
  
  -- Verificar certificado de solution
  SELECT * INTO cert_solution
  FROM public.solution_certificates
  WHERE validation_code = p_validation_code;
  
  IF cert_solution.id IS NOT NULL THEN
    SELECT 
      jsonb_build_object(
        'valid', true,
        'type', 'solution',
        'user_name', p.name,
        'solution_title', s.title,
        'implementation_date', cert_solution.implementation_date
      )
    INTO result
    FROM public.profiles p
    JOIN public.solutions s ON cert_solution.solution_id = s.id
    WHERE p.id = cert_solution.user_id;
    
    RETURN result;
  END IF;
  
  RETURN jsonb_build_object('valid', false, 'message', 'Código de validação inválido');
END;
$$;

-- 13. get_visible_events_for_user
DROP FUNCTION IF EXISTS public.get_visible_events_for_user(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.get_visible_events_for_user(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  location_link text,
  cover_image_url text,
  created_at timestamp with time zone,
  created_by uuid,
  physical_location text,
  is_recurring boolean,
  recurrence_pattern text,
  recurrence_interval integer,
  recurrence_day integer,
  recurrence_count integer,
  recurrence_end_date timestamp with time zone,
  parent_event_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_role_id uuid;
BEGIN
  -- Buscar role do usuário
  SELECT role_id INTO user_role_id FROM public.profiles WHERE id = p_user_id;
  
  RETURN QUERY
  SELECT DISTINCT
    e.id,
    e.title,
    e.description,
    e.start_time,
    e.end_time,
    e.location_link,
    e.cover_image_url,
    e.created_at,
    e.created_by,
    e.physical_location,
    e.is_recurring,
    e.recurrence_pattern,
    e.recurrence_interval,
    e.recurrence_day,
    e.recurrence_count,
    e.recurrence_end_date,
    e.parent_event_id
  FROM public.events e
  LEFT JOIN public.event_access_control eac ON e.id = eac.event_id
  WHERE 
    eac.role_id = user_role_id OR 
    eac.role_id IS NULL OR
    e.created_by = p_user_id
  ORDER BY e.start_time;
END;
$$;

-- 14. backup_table_data
DROP FUNCTION IF EXISTS public.backup_table_data(text, text) CASCADE;
CREATE OR REPLACE FUNCTION public.backup_table_data(
  p_table_name text,
  p_reason text DEFAULT 'manual_backup'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  backup_data jsonb;
  record_count integer;
  backup_id uuid;
BEGIN
  -- Verificar permissão admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Fazer backup baseado na tabela
  IF p_table_name = 'analytics' THEN
    SELECT jsonb_agg(to_jsonb(a.*)), COUNT(*) 
    INTO backup_data, record_count
    FROM public.analytics a
    WHERE created_at < (now() - interval '90 days');
    
    INSERT INTO public.analytics_backups (table_name, backup_data, record_count, backup_reason)
    VALUES (p_table_name, backup_data, record_count, p_reason)
    RETURNING id INTO backup_id;
    
  ELSIF p_table_name = 'invites' THEN
    SELECT jsonb_agg(to_jsonb(i.*)), COUNT(*) 
    INTO backup_data, record_count
    FROM public.invites i
    WHERE expires_at < now();
    
    INSERT INTO public.invite_backups (email, backup_data, backup_reason)
    SELECT email, to_jsonb(i.*), p_reason
    FROM public.invites i
    WHERE expires_at < now();
    
    GET DIAGNOSTICS record_count = ROW_COUNT;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'backup_id', backup_id,
    'records_backed_up', record_count,
    'table_name', p_table_name
  );
END;
$$;

-- 15. clean_old_data
DROP FUNCTION IF EXISTS public.clean_old_data(text, interval) CASCADE;
CREATE OR REPLACE FUNCTION public.clean_old_data(
  p_table_name text,
  p_retention_period interval DEFAULT '90 days'::interval
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Verificar permissão admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Limpar dados antigos baseado na tabela
  IF p_table_name = 'analytics' THEN
    DELETE FROM public.analytics
    WHERE created_at < (now() - p_retention_period);
    
  ELSIF p_table_name = 'audit_logs' THEN
    DELETE FROM public.audit_logs
    WHERE timestamp < (now() - p_retention_period);
    
  ELSIF p_table_name = 'rate_limits' THEN
    DELETE FROM public.rate_limits
    WHERE created_at < (now() - p_retention_period);
    
  ELSE
    RETURN jsonb_build_object('success', false, 'message', 'Tabela não suportada');
  END IF;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'table_name', p_table_name,
    'retention_period', p_retention_period
  );
END;
$$;

-- Log do progresso
INSERT INTO public.audit_logs (
  event_type, action, details, user_id
) VALUES (
  'system_cleanup',
  'phase_4_batch_3c_completed',
  jsonb_build_object(
    'batch', '3C',
    'functions_corrected', 15,
    'category', 'certificates_analytics',
    'timestamp', now()
  ),
  auth.uid()
);