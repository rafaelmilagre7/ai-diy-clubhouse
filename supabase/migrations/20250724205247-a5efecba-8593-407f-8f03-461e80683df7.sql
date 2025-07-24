-- Corrigir erro de migração - remover funções existentes antes de recriar

-- Remover todas as funções que vamos recriar
DROP FUNCTION IF EXISTS public.get_admin_analytics_overview() CASCADE;
DROP FUNCTION IF EXISTS public.get_invite_dashboard_stats() CASCADE;
DROP FUNCTION IF EXISTS public.create_community_notification(uuid, text, text, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.sync_onboarding_to_profile() CASCADE;
DROP FUNCTION IF EXISTS public.generate_referral_token() CASCADE;
DROP FUNCTION IF EXISTS public.generate_invite_token() CASCADE;
DROP FUNCTION IF EXISTS public.generate_certificate_validation_code() CASCADE;

-- Remover views inseguras
DROP VIEW IF EXISTS public.admin_analytics_overview CASCADE;
DROP VIEW IF EXISTS public.invite_dashboard_stats CASCADE;

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

-- Funções auxiliares de token
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT encode(gen_random_bytes(32), 'base64url');
$function$;

CREATE OR REPLACE FUNCTION public.generate_certificate_validation_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 'CERT-' || upper(substring(encode(gen_random_bytes(8), 'base64'), 1, 10));
$function$;