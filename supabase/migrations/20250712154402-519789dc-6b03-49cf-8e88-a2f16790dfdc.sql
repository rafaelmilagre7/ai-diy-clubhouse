-- Migration: Fix search_path vulnerabilities - Final batch (no audit logs)
-- Adding SET search_path = '' to core functions

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

-- 2. Fix get_user_security_permissions function
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

-- 3. Fix log_security_event function
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

-- 4. Fix create_invite function  
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

-- 5. Fix create_onboarding_backup function
CREATE OR REPLACE FUNCTION public.create_onboarding_backup(p_user_id uuid, p_backup_type text DEFAULT 'auto'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  v_backup_id UUID;
  v_onboarding_data JSONB;
  v_profiles_data JSONB;
BEGIN
  SELECT to_jsonb(onboarding_final.*) INTO v_onboarding_data
  FROM public.onboarding_final
  WHERE user_id = p_user_id;

  SELECT to_jsonb(profiles.*) INTO v_profiles_data
  FROM public.profiles
  WHERE id = p_user_id;

  INSERT INTO public.onboarding_backups (
    user_id,
    backup_type,
    onboarding_data,
    profiles_data
  )
  VALUES (
    p_user_id,
    p_backup_type,
    COALESCE(v_onboarding_data, '{}'),
    COALESCE(v_profiles_data, '{}')
  )
  RETURNING id INTO v_backup_id;

  RETURN v_backup_id;
END;
$function$;

-- 6. Fix create_connection_notification function
CREATE OR REPLACE FUNCTION public.create_connection_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  requester_name TEXT;
  recipient_name TEXT;
BEGIN
  SELECT name INTO requester_name FROM public.profiles WHERE id = NEW.requester_id;
  SELECT name INTO recipient_name FROM public.profiles WHERE id = NEW.recipient_id;
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      NEW.recipient_id,
      'connection_request',
      'Nova solicitação de conexão',
      COALESCE(requester_name, 'Alguém') || ' quer se conectar com você',
      jsonb_build_object(
        'requester_id', NEW.requester_id,
        'requester_name', COALESCE(requester_name, 'Usuário'),
        'connection_id', NEW.id
      )
    );
    
  ELSIF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
    IF NEW.status = 'accepted' THEN
      INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        data
      ) VALUES (
        NEW.requester_id,
        'connection_accepted',
        'Conexão aceita',
        COALESCE(recipient_name, 'Alguém') || ' aceitou sua solicitação de conexão',
        jsonb_build_object(
          'accepter_id', NEW.recipient_id,
          'accepter_name', COALESCE(recipient_name, 'Usuário'),
          'connection_id', NEW.id
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 7. Fix log_role_change function
CREATE OR REPLACE FUNCTION public.log_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  old_role_name TEXT;
  new_role_name TEXT;
BEGIN
  IF OLD.role_id IS NOT NULL THEN
    SELECT name INTO old_role_name FROM public.user_roles WHERE id = OLD.role_id;
  END IF;
  
  IF NEW.role_id IS NOT NULL THEN
    SELECT name INTO new_role_name FROM public.user_roles WHERE id = NEW.role_id;
  END IF;
  
  IF OLD.role_id IS DISTINCT FROM NEW.role_id THEN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      resource_id,
      details,
      severity
    ) VALUES (
      auth.uid(),
      'role_change',
      'update_user_role',
      NEW.id::TEXT,
      jsonb_build_object(
        'target_user_id', NEW.id,
        'old_role_id', OLD.role_id,
        'new_role_id', NEW.role_id,
        'old_role_name', old_role_name,
        'new_role_name', new_role_name,
        'timestamp', NOW(),
        'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
      ),
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;