-- Corrigir funções restantes sem search_path (batch 1 - mais importantes)

-- Corrigir funções de criação de usuários e perfis
DROP FUNCTION IF EXISTS public.create_user_backup CASCADE;
CREATE OR REPLACE FUNCTION public.create_user_backup(p_user_id uuid, p_backup_type text DEFAULT 'manual')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  backup_id uuid;
  backup_data jsonb;
BEGIN
  -- Verificar permissões
  IF NOT (auth.uid() = p_user_id OR public.is_user_admin_secure(auth.uid())) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Permission denied'
    );
  END IF;
  
  -- Coletar dados do usuário
  SELECT jsonb_build_object(
    'profile', to_jsonb(p.*),
    'progress', COALESCE(array_agg(DISTINCT to_jsonb(lp.*)), ARRAY[]::jsonb[]),
    'analytics', COALESCE(array_agg(DISTINCT to_jsonb(a.*)), ARRAY[]::jsonb[])
  ) INTO backup_data
  FROM profiles p
  LEFT JOIN learning_progress lp ON p.id = lp.user_id
  LEFT JOIN analytics a ON p.id = a.user_id
  WHERE p.id = p_user_id
  GROUP BY p.id;
  
  INSERT INTO user_backups (
    user_id,
    backup_type,
    backup_data,
    created_at
  ) VALUES (
    p_user_id,
    p_backup_type,
    backup_data,
    now()
  ) RETURNING id INTO backup_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'backup_id', backup_id,
    'backup_type', p_backup_type,
    'created_at', now()
  );
END;
$function$;

DROP FUNCTION IF EXISTS public.create_network_connection CASCADE;
CREATE OR REPLACE FUNCTION public.create_network_connection(p_recipient_id uuid, p_message text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  connection_id uuid;
  requester_id uuid;
BEGIN
  requester_id := auth.uid();
  
  -- Verificar se já existe conexão
  IF EXISTS (
    SELECT 1 FROM member_connections
    WHERE (requester_id = requester_id AND recipient_id = p_recipient_id)
       OR (requester_id = p_recipient_id AND recipient_id = requester_id)
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Connection already exists'
    );
  END IF;
  
  INSERT INTO member_connections (
    requester_id,
    recipient_id,
    status,
    created_at
  ) VALUES (
    requester_id,
    p_recipient_id,
    'pending',
    now()
  ) RETURNING id INTO connection_id;
  
  -- Criar notificação
  PERFORM public.create_community_notification(
    p_recipient_id,
    'Nova solicitação de conexão',
    p_message,
    'connection_request',
    jsonb_build_object('connection_id', connection_id, 'requester_id', requester_id)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'connection_id', connection_id,
    'status', 'pending',
    'created_at', now()
  );
END;
$function$;

DROP FUNCTION IF EXISTS public.update_user_preferences CASCADE;
CREATE OR REPLACE FUNCTION public.update_user_preferences(p_user_id uuid, p_preferences jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  updated_profile record;
BEGIN
  -- Verificar permissões
  IF NOT (auth.uid() = p_user_id OR public.is_user_admin_secure(auth.uid())) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Permission denied'
    );
  END IF;
  
  UPDATE profiles
  SET 
    preferences = COALESCE(preferences, '{}'::jsonb) || p_preferences,
    updated_at = now()
  WHERE id = p_user_id
  RETURNING * INTO updated_profile;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'preferences', updated_profile.preferences,
    'updated_at', updated_profile.updated_at
  );
END;
$function$;

-- Funções de convites
DROP FUNCTION IF EXISTS public.create_invite_batch CASCADE;
CREATE OR REPLACE FUNCTION public.create_invite_batch(p_emails text[], p_role_id uuid, p_expires_in interval DEFAULT '7 days')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  created_count integer := 0;
  failed_count integer := 0;
  result jsonb;
  email_item text;
BEGIN
  -- Verificar permissão admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Permissão negada'
    );
  END IF;
  
  -- Processar cada email
  FOREACH email_item IN ARRAY p_emails
  LOOP
    BEGIN
      INSERT INTO invites (
        email,
        role_id,
        token,
        expires_at,
        created_by
      ) VALUES (
        email_item,
        p_role_id,
        public.generate_invite_token(),
        now() + p_expires_in,
        auth.uid()
      );
      created_count := created_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        failed_count := failed_count + 1;
    END;
  END LOOP;
  
  result := jsonb_build_object(
    'success', true,
    'created_count', created_count,
    'failed_count', failed_count,
    'total_processed', array_length(p_emails, 1)
  );
  
  RETURN result;
END;
$function$;

DROP FUNCTION IF EXISTS public.cleanup_expired_invites CASCADE;
CREATE OR REPLACE FUNCTION public.cleanup_expired_invites()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count integer;
BEGIN
  -- Backup antes da limpeza
  INSERT INTO invite_backups (
    email, backup_data, backup_reason
  )
  SELECT 
    email,
    to_jsonb(i.*),
    'Cleanup automático de convites expirados'
  FROM invites i
  WHERE expires_at < now() AND used_at IS NULL;
  
  -- Deletar expirados
  DELETE FROM invites 
  WHERE expires_at < now() AND used_at IS NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'cleanup_date', now()
  );
END;
$function$;