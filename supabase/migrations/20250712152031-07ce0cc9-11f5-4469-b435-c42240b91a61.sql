-- Migration: Fix search_path vulnerabilities for all functions
-- Adding SET search_path = '' to functions identified in security warnings

-- 1. Authentication and Authorization Functions
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
  -- Determinar qual timestamp atualizar baseado no status
  timestamp_field := CASE p_status
    WHEN 'sent' THEN 'sent_at'
    WHEN 'delivered' THEN 'delivered_at'
    WHEN 'opened' THEN 'opened_at'
    WHEN 'clicked' THEN 'clicked_at'
    WHEN 'failed' THEN 'failed_at'
    ELSE NULL
  END;

  -- Verificar se já existe um registro para este convite e canal
  SELECT id INTO delivery_id
  FROM public.invite_deliveries
  WHERE invite_id = p_invite_id AND channel = p_channel;

  IF delivery_id IS NOT NULL THEN
    -- Atualizar registro existente
    EXECUTE format(
      'UPDATE public.invite_deliveries 
       SET status = $1, provider_id = COALESCE($2, provider_id), 
           error_message = $3, metadata = metadata || $4, updated_at = now()%s
       WHERE id = $5',
      CASE WHEN timestamp_field IS NOT NULL THEN ', ' || timestamp_field || ' = now()' ELSE '' END
    ) USING p_status, p_provider_id, p_error_message, p_metadata, delivery_id;
  ELSE
    -- Criar novo registro
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

CREATE OR REPLACE FUNCTION public.get_courses_with_stats()
 RETURNS TABLE(id uuid, title text, description text, cover_image_url text, slug text, published boolean, created_at timestamp with time zone, updated_at timestamp with time zone, order_index integer, created_by uuid, module_count integer, lesson_count integer, is_restricted boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT * FROM learning_courses_with_stats ORDER BY order_index;
$function$;

CREATE OR REPLACE FUNCTION public.complete_onboarding(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  onboarding_record public.onboarding_final;
BEGIN
  -- Buscar registro de onboarding
  SELECT * INTO onboarding_record
  FROM public.onboarding_final
  WHERE user_id = p_user_id;
  
  IF onboarding_record.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Registro de onboarding não encontrado'
    );
  END IF;
  
  -- Marcar onboarding como completo
  UPDATE public.onboarding_final
  SET 
    is_completed = true,
    completed_at = now(),
    current_step = 7, -- Último step
    completed_steps = ARRAY[1,2,3,4,5,6] -- Todos os steps
  WHERE user_id = p_user_id;
  
  -- Atualizar profile para marcar onboarding_completed
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

CREATE OR REPLACE FUNCTION public.get_lessons_with_relations(p_course_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, title text, description text, cover_image_url text, module_id uuid, content jsonb, order_index integer, ai_assistant_enabled boolean, ai_assistant_prompt text, ai_assistant_id character varying, published boolean, difficulty_level text, created_at timestamp with time zone, updated_at timestamp with time zone, estimated_time_minutes integer, module json, videos json, resources json)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT * FROM learning_lessons_with_relations
  WHERE p_course_id IS NULL OR module->>'course_id' = p_course_id::text
  ORDER BY (module->>'order_index')::integer, order_index;
$function$;

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
  
  -- Validar preferência de canal
  IF p_channel_preference NOT IN ('email', 'whatsapp', 'both') THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Preferência de canal inválida'
    );
  END IF;
  
  -- Validar telefone se necessário
  IF (p_channel_preference = 'whatsapp' OR p_channel_preference = 'both') AND p_phone IS NULL THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Telefone é obrigatório para envio via WhatsApp'
    );
  END IF;
  
  -- Gerar token único
  new_token := public.generate_invite_token();
  
  -- Criar novo convite usando os campos corretos da tabela
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
  -- Verificações de segurança da senha
  checks := jsonb_build_object(
    'length', length(password) >= 8,
    'uppercase', password ~ '[A-Z]',
    'lowercase', password ~ '[a-z]',
    'number', password ~ '[0-9]',
    'special', password ~ '[!@#$%^&*()_+\-=\[\]{};'':"\\|,.<>\/?]'
  );
  
  -- Calcular pontuação
  score := (
    CASE WHEN checks->>'length' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'uppercase' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'lowercase' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'number' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'special' = 'true' THEN 1 ELSE 0 END
  );
  
  -- Determinar força
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

CREATE OR REPLACE FUNCTION public.log_account_creation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Log da criação de conta para auditoria
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

-- Continue with more functions...
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

-- Log the completion of search_path fixes
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'system_maintenance',
  'search_path_fixes_batch_1',
  jsonb_build_object(
    'completed_at', NOW(),
    'functions_fixed', 12,
    'batch', 'Critical functions - auth, invites, courses',
    'remaining_warnings', 'Will be addressed in subsequent batches'
  )
);