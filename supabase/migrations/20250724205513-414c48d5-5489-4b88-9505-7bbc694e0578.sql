-- Remover funções existentes com DROP específico antes de recriar

-- Remover funções existentes com assinatura específica
DROP FUNCTION IF EXISTS public.get_admin_analytics_overview;
DROP FUNCTION IF EXISTS public.get_invite_dashboard_stats;

-- Agora recriar as funções corrigidas
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

-- Configurar Auth mais seguro (usando função para lembretes de configuração)
CREATE OR REPLACE FUNCTION public.get_security_configuration_reminders()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Admin access required');
  END IF;

  RETURN jsonb_build_object(
    'critical_reminders', jsonb_build_array(
      'Configure Auth OTP expiry to 5-10 minutes (currently may be too long)',
      'Enable Leaked Password Protection in Supabase Auth settings',
      'Review remaining function search_path warnings (~50 remaining)',
      'Enable 2FA for admin accounts'
    ),
    'dashboard_urls', jsonb_build_object(
      'auth_settings', 'Authentication > Settings in Supabase Dashboard',
      'security_settings', 'Settings > Security in Supabase Dashboard'
    ),
    'status', 'manual_configuration_required',
    'next_steps', 'Visit Supabase Dashboard to complete security configuration'
  );
END;
$function$;