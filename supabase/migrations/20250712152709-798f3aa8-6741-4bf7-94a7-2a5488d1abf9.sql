-- Migration: Fix search_path vulnerabilities - Core functions only
-- Adding SET search_path = '' to existing functions without logging issues

-- 1. Fix log_invite_delivery function
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

-- 2. Fix complete_onboarding function
CREATE OR REPLACE FUNCTION public.complete_onboarding(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  onboarding_record public.onboarding_final;
BEGIN
  SELECT * INTO onboarding_record
  FROM public.onboarding_final
  WHERE user_id = p_user_id;
  
  IF onboarding_record.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Registro de onboarding não encontrado'
    );
  END IF;
  
  UPDATE public.onboarding_final
  SET 
    is_completed = true,
    completed_at = now(),
    current_step = 7,
    completed_steps = ARRAY[1,2,3,4,5,6]
  WHERE user_id = p_user_id;
  
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

-- 3. Fix get_users_with_roles function
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

-- 4. Fix create_invite_hybrid function
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
  
  IF (p_channel_preference = 'whatsapp' OR p_channel_preference = 'both') AND p_phone IS NULL THEN
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