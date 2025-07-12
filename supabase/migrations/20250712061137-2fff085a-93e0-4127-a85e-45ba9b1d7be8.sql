-- Migration: Complete search_path fix for all remaining functions (Part 2)
-- This migration addresses all remaining function_search_path_mutable warnings

-- Fix functions with proper table references and search_path settings

-- 1. log_invite_delivery (corrected)
CREATE OR REPLACE FUNCTION public.log_invite_delivery(p_invite_id uuid, p_channel character varying, p_status character varying, p_provider_id text DEFAULT NULL::text, p_error_message text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  delivery_id UUID;
  timestamp_field TEXT;
BEGIN
  timestamp_field := CASE p_status
    WHEN 'sent' THEN 'sent_at'
    WHEN 'delivered' THEN 'delivered_at'
    WHEN 'opened' THEN 'opened_at'
    WHEN 'clicked' THEN 'clicked_at'
    WHEN 'failed' THEN 'failed_at'
    ELSE NULL
  END;

  SELECT id INTO delivery_id
  FROM public.invite_deliveries
  WHERE invite_id = p_invite_id AND channel = p_channel;

  IF delivery_id IS NOT NULL THEN
    EXECUTE format(
      'UPDATE public.invite_deliveries 
       SET status = $1, provider_id = COALESCE($2, provider_id), 
           error_message = $3, metadata = metadata || $4, updated_at = now()%s
       WHERE id = $5',
      CASE WHEN timestamp_field IS NOT NULL THEN ', ' || timestamp_field || ' = now()' ELSE '' END
    ) USING p_status, p_provider_id, p_error_message, p_metadata, delivery_id;
  ELSE
    EXECUTE format(
      'INSERT INTO public.invite_deliveries 
       (invite_id, channel, status, provider_id, error_message, metadata%s) 
       VALUES ($1, $2, $3, $4, $5, $6%s) 
       RETURNING id',
      CASE WHEN timestamp_field IS NOT NULL THEN ', ' || timestamp_field ELSE '' END,
      CASE WHEN timestamp_field IS NOT NULL THEN ', now()' ELSE '' END
    ) USING p_invite_id, p_channel, p_status, p_provider_id, p_error_message, p_metadata
    INTO delivery_id;
  END IF;

  RETURN delivery_id;
END;
$function$;

-- 2. get_courses_with_stats (corrected to use actual table)
CREATE OR REPLACE FUNCTION public.get_courses_with_stats()
 RETURNS TABLE(id uuid, title text, description text, cover_image_url text, slug text, published boolean, created_at timestamp with time zone, updated_at timestamp with time zone, order_index integer, created_by uuid, module_count bigint, lesson_count bigint, is_restricted boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
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
    COALESCE(module_stats.module_count, 0) as module_count,
    COALESCE(lesson_stats.lesson_count, 0) as lesson_count,
    CASE WHEN access_control.course_id IS NOT NULL THEN true ELSE false END as is_restricted
  FROM public.learning_courses lc
  LEFT JOIN (
    SELECT course_id, COUNT(*) as module_count
    FROM public.learning_modules
    GROUP BY course_id
  ) module_stats ON lc.id = module_stats.course_id
  LEFT JOIN (
    SELECT lm.course_id, COUNT(ll.*) as lesson_count
    FROM public.learning_modules lm
    LEFT JOIN public.learning_lessons ll ON lm.id = ll.module_id
    GROUP BY lm.course_id
  ) lesson_stats ON lc.id = lesson_stats.course_id
  LEFT JOIN (
    SELECT DISTINCT course_id
    FROM public.course_access_control
  ) access_control ON lc.id = access_control.course_id
  ORDER BY lc.order_index NULLS LAST;
END;
$function$;

-- 3. complete_onboarding
CREATE OR REPLACE FUNCTION public.complete_onboarding(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  profile_exists boolean;
BEGIN
  -- Check if user profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = p_user_id) INTO profile_exists;
  
  IF NOT profile_exists THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Perfil de usuário não encontrado'
    );
  END IF;
  
  -- Update profile to mark onboarding as completed
  UPDATE public.profiles
  SET 
    onboarding_completed = true,
    onboarding_completed_at = now()
  WHERE id = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Onboarding completado com sucesso'
  );
END;
$function$;

-- 4. log_permission_change
CREATE OR REPLACE FUNCTION public.log_permission_change(user_id uuid, action_type character varying, target_user_id uuid DEFAULT NULL::uuid, role_id uuid DEFAULT NULL::uuid, role_name character varying DEFAULT NULL::character varying, permission_id uuid DEFAULT NULL::uuid, permission_code character varying DEFAULT NULL::character varying, old_value text DEFAULT NULL::text, new_value text DEFAULT NULL::text, ip_address text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  log_id UUID;
BEGIN
  -- Log in audit_logs table since permission_audit_logs may not exist
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details
  ) VALUES (
    user_id,
    'permission_change',
    action_type,
    target_user_id::text,
    jsonb_build_object(
      'target_user_id', target_user_id,
      'role_id', role_id,
      'role_name', role_name,
      'permission_id', permission_id,
      'permission_code', permission_code,
      'old_value', old_value,
      'new_value', new_value,
      'ip_address', ip_address
    )
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- 5. get_users_with_roles
CREATE OR REPLACE FUNCTION public.get_users_with_roles(limit_count integer DEFAULT 100, offset_count integer DEFAULT 0, search_query text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, email text, name text, avatar_url text, role text, role_id uuid, user_roles jsonb, company_name text, industry text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, 
    p.email, 
    p.name, 
    p.avatar_url, 
    p.role,
    p.role_id,
    jsonb_build_object('id', ur.id, 'name', ur.name, 'description', ur.description) AS user_roles,
    p.company_name,
    p.industry,
    p.created_at
  FROM 
    public.profiles p
  LEFT JOIN 
    public.user_roles ur ON p.role_id = ur.id
  WHERE 
    (search_query IS NULL OR 
     p.name ILIKE '%' || search_query || '%' OR 
     p.email ILIKE '%' || search_query || '%' OR
     p.company_name ILIKE '%' || search_query || '%' OR
     ur.name ILIKE '%' || search_query || '%')
  ORDER BY 
    p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$function$;

-- 6. get_lessons_with_relations (corrected to use actual tables)
CREATE OR REPLACE FUNCTION public.get_lessons_with_relations(p_course_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, title text, description text, cover_image_url text, module_id uuid, content jsonb, order_index integer, ai_assistant_enabled boolean, ai_assistant_prompt text, ai_assistant_id character varying, published boolean, difficulty_level text, created_at timestamp with time zone, updated_at timestamp with time zone, estimated_time_minutes integer, module json, videos json, resources json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ll.id,
    ll.title,
    ll.description,
    ll.cover_image_url,
    ll.module_id,
    ll.content,
    ll.order_index,
    ll.ai_assistant_enabled,
    ll.ai_assistant_prompt,
    ll.ai_assistant_id,
    ll.published,
    ll.difficulty_level,
    ll.created_at,
    ll.updated_at,
    ll.estimated_time_minutes,
    jsonb_build_object(
      'id', lm.id,
      'title', lm.title,
      'course_id', lm.course_id,
      'order_index', lm.order_index
    ) as module,
    COALESCE(video_data.videos, '[]'::json) as videos,
    COALESCE(resource_data.resources, '[]'::json) as resources
  FROM public.learning_lessons ll
  LEFT JOIN public.learning_modules lm ON ll.module_id = lm.id
  LEFT JOIN (
    SELECT 
      lesson_id,
      json_agg(
        json_build_object(
          'id', id,
          'title', title,
          'url', url,
          'order_index', order_index
        ) ORDER BY order_index
      ) as videos
    FROM public.learning_lesson_videos
    GROUP BY lesson_id
  ) video_data ON ll.id = video_data.lesson_id
  LEFT JOIN (
    SELECT 
      lesson_id,
      json_agg(
        json_build_object(
          'id', id,
          'title', title,
          'url', url,
          'type', type
        ) ORDER BY created_at
      ) as resources
    FROM public.learning_resources
    GROUP BY lesson_id
  ) resource_data ON ll.id = resource_data.lesson_id
  WHERE (p_course_id IS NULL OR lm.course_id = p_course_id)
  ORDER BY lm.order_index NULLS LAST, ll.order_index;
END;
$function$;

-- Continue with more key functions that need fixing

-- 7. create_invite_hybrid
CREATE OR REPLACE FUNCTION public.create_invite_hybrid(p_email text, p_role_id uuid, p_phone text DEFAULT NULL::text, p_expires_in interval DEFAULT '7 days'::interval, p_notes text DEFAULT NULL::text, p_channel_preference text DEFAULT 'email'::text)
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
  
  IF p_channel_preference NOT IN ('email', 'whatsapp', 'both') THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Preferência de canal inválida'
    );
  END IF;
  
  IF (p_channel_preference IN ('whatsapp', 'both')) AND p_phone IS NULL THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Telefone é obrigatório para envio via WhatsApp'
    );
  END IF;
  
  new_token := public.generate_invite_token();
  
  INSERT INTO public.invites (
    email,
    whatsapp_number,
    role_id,
    token,
    expires_at,
    created_by,
    notes,
    preferred_channel
  )
  VALUES (
    p_email,
    p_phone,
    p_role_id,
    new_token,
    now() + p_expires_in,
    created_by_id,
    p_notes,
    p_channel_preference
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

-- 8. validate_user_password
CREATE OR REPLACE FUNCTION public.validate_user_password(password text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  checks jsonb;
  score integer;
  strength text;
BEGIN
  checks := jsonb_build_object(
    'length', length(password) >= 8,
    'uppercase', password ~ '[A-Z]',
    'lowercase', password ~ '[a-z]',
    'number', password ~ '[0-9]',
    'special', password ~ '[!@#$%^&*()_+\-=\[\]{};'':"\\|,.<>\/?]'
  );
  
  score := (
    CASE WHEN checks->>'length' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'uppercase' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'lowercase' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'number' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'special' = 'true' THEN 1 ELSE 0 END
  );
  
  strength := CASE 
    WHEN score < 3 THEN 'weak'
    WHEN score < 5 THEN 'medium'
    ELSE 'strong'
  END;
  
  RETURN jsonb_build_object(
    'checks', checks,
    'score', score,
    'strength', strength,
    'is_valid', score >= 4
  );
END;
$function$;

-- 9. log_account_creation
CREATE OR REPLACE FUNCTION public.log_account_creation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details
  ) VALUES (
    NEW.id,
    'account_creation',
    'user_signup',
    jsonb_build_object(
      'email', NEW.email,
      'created_at', NEW.created_at,
      'invite_token', NEW.raw_user_meta_data->>'invite_token'
    )
  );
  
  RETURN NEW;
END;
$function$;

-- 10. check_rls_status
CREATE OR REPLACE FUNCTION public.check_rls_status()
 RETURNS TABLE(table_name text, rls_enabled boolean, has_policies boolean, policy_count bigint, security_status text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT 
    t.tablename::text,
    t.rowsecurity as rls_enabled,
    CASE WHEN COUNT(p.policyname) > 0 THEN true ELSE false END as has_policies,
    COUNT(p.policyname) as policy_count,
    CASE 
      WHEN t.rowsecurity = true AND COUNT(p.policyname) > 0 THEN '✅ SEGURO'
      WHEN t.rowsecurity = false AND COUNT(p.policyname) > 0 THEN '⚠️ RLS DESABILITADO'
      WHEN t.rowsecurity = false AND COUNT(p.policyname) = 0 THEN '🔴 SEM PROTEÇÃO'
      ELSE '❓ VERIFICAR'
    END as security_status
  FROM pg_tables t
  LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
  WHERE t.schemaname = 'public'
  AND t.tablename NOT LIKE '%backup%'
  GROUP BY t.tablename, t.rowsecurity
  ORDER BY 
    CASE 
      WHEN t.rowsecurity = false AND COUNT(p.policyname) = 0 THEN 1
      WHEN t.rowsecurity = false AND COUNT(p.policyname) > 0 THEN 2
      ELSE 3
    END,
    t.tablename;
$function$;