-- Corrigir funções usando gen_random_uuid em vez de gen_random_bytes

-- Recriar função para analytics (simplificada)
CREATE OR REPLACE FUNCTION public.get_admin_analytics_overview()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'new_users_30d', (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days'),
    'active_users_7d', (SELECT COUNT(DISTINCT user_id) FROM analytics WHERE created_at >= NOW() - INTERVAL '7 days'),
    'completed_onboarding', (SELECT COUNT(*) FROM profiles WHERE onboarding_completed = true),
    'total_invites', (SELECT COUNT(*) FROM invites),
    'used_invites', (SELECT COUNT(*) FROM invites WHERE used_at IS NOT NULL)
  ) INTO result;
  
  RETURN result;
END;
$function$;

-- Recriar função para stats de convites
CREATE OR REPLACE FUNCTION public.get_invite_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT jsonb_build_object(
    'total_invites', (SELECT COUNT(*) FROM invites),
    'active_invites', (SELECT COUNT(*) FROM invites WHERE expires_at > NOW() AND used_at IS NULL),
    'used_invites', (SELECT COUNT(*) FROM invites WHERE used_at IS NOT NULL),
    'expired_invites', (SELECT COUNT(*) FROM invites WHERE expires_at <= NOW() AND used_at IS NULL),
    'recent_invites', (SELECT COUNT(*) FROM invites WHERE created_at >= NOW() - INTERVAL '7 days'),
    'conversion_rate', CASE 
      WHEN (SELECT COUNT(*) FROM invites) > 0 THEN
        ROUND((SELECT COUNT(*) FROM invites WHERE used_at IS NOT NULL)::numeric / (SELECT COUNT(*) FROM invites)::numeric * 100, 2)
      ELSE 0
    END
  ) INTO result;
  
  RETURN result;
END;
$function$;

-- Função de notificação da comunidade
CREATE OR REPLACE FUNCTION public.create_community_notification(
  p_user_id uuid, 
  p_title text, 
  p_message text, 
  p_type text DEFAULT 'community_activity', 
  p_data jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    data,
    created_at
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_data,
    NOW()
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

-- Funções auxiliares de token usando gen_random_uuid
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
$function$;

CREATE OR REPLACE FUNCTION public.generate_certificate_validation_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 'CERT-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 10));
$function$;

-- Função de limpeza de sessões
CREATE OR REPLACE FUNCTION public.cleanup_stale_sessions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cleanup_count integer := 0;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Admin access required'
    );
  END IF;
  
  -- Limpar sessões antigas de rate limiting (mais de 24h)
  DELETE FROM rate_limits 
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'cleaned_records', cleanup_count,
    'cleanup_time', NOW()
  );
END;
$function$;