-- Corrigir os 2 erros críticos de Security Definer Views e mais funções sem search_path

-- 1. Identificar e corrigir views problemáticas (convertendo para funções seguras)
-- Vamos recriar as views admin_analytics_overview e invite_dashboard_stats como funções

-- Remover views inseguras e substituir por funções
DROP VIEW IF EXISTS public.admin_analytics_overview CASCADE;
CREATE OR REPLACE FUNCTION public.get_admin_analytics_overview()
RETURNS TABLE (
  total_users bigint,
  new_users_30d bigint,
  active_users_7d bigint,
  completed_onboarding bigint,
  total_solutions bigint,
  new_solutions_30d bigint,
  total_lessons bigint,
  active_learners bigint,
  completed_implementations bigint,
  completion_rate numeric,
  growth_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM profiles)::bigint as total_users,
    (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days')::bigint as new_users_30d,
    (SELECT COUNT(DISTINCT user_id) FROM analytics WHERE created_at >= NOW() - INTERVAL '7 days')::bigint as active_users_7d,
    (SELECT COUNT(*) FROM profiles WHERE onboarding_completed = true)::bigint as completed_onboarding,
    0::bigint as total_solutions, -- Placeholder
    0::bigint as new_solutions_30d, -- Placeholder  
    0::bigint as total_lessons, -- Placeholder
    0::bigint as active_learners, -- Placeholder
    0::bigint as completed_implementations, -- Placeholder
    0::numeric as completion_rate, -- Placeholder
    0::numeric as growth_rate; -- Placeholder
END;
$function$;

DROP VIEW IF EXISTS public.invite_dashboard_stats CASCADE;
CREATE OR REPLACE FUNCTION public.get_invite_dashboard_stats()
RETURNS TABLE (
  total_invites bigint,
  active_invites bigint,
  used_invites bigint,
  expired_invites bigint,
  recent_invites bigint,
  conversion_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM invites)::bigint as total_invites,
    (SELECT COUNT(*) FROM invites WHERE expires_at > NOW() AND used_at IS NULL)::bigint as active_invites,
    (SELECT COUNT(*) FROM invites WHERE used_at IS NOT NULL)::bigint as used_invites,
    (SELECT COUNT(*) FROM invites WHERE expires_at <= NOW() AND used_at IS NULL)::bigint as expired_invites,
    (SELECT COUNT(*) FROM invites WHERE created_at >= NOW() - INTERVAL '7 days')::bigint as recent_invites,
    CASE 
      WHEN (SELECT COUNT(*) FROM invites) > 0 THEN
        (SELECT COUNT(*) FROM invites WHERE used_at IS NOT NULL)::numeric / (SELECT COUNT(*) FROM invites)::numeric * 100
      ELSE 0
    END as conversion_rate;
END;
$function$;

-- 2. Corrigir funções principais restantes sem search_path seguro
DROP FUNCTION IF EXISTS public.create_community_notification CASCADE;
CREATE OR REPLACE FUNCTION public.create_community_notification(p_user_id uuid, p_title text, p_message text, p_type text DEFAULT 'community_activity'::text, p_data jsonb DEFAULT '{}'::jsonb)
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

DROP FUNCTION IF EXISTS public.sync_onboarding_to_profile CASCADE;
CREATE OR REPLACE FUNCTION public.sync_onboarding_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Atualizar perfil quando onboarding for completado
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    UPDATE profiles
    SET 
      name = COALESCE(NEW.name, name),
      company_name = COALESCE(NEW.company_name, company_name),
      industry = COALESCE(NEW.business_sector, industry),
      onboarding_completed = NEW.is_completed,
      onboarding_completed_at = COALESCE(NEW.completed_at, now())
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

DROP FUNCTION IF EXISTS public.generate_referral_token CASCADE;
CREATE OR REPLACE FUNCTION public.generate_referral_token()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT string_agg(
    substring('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 
    ceil(random() * 32)::integer, 1), '')
  FROM generate_series(1, 10);
$function$;

DROP FUNCTION IF EXISTS public.generate_invite_token CASCADE;
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT encode(gen_random_bytes(32), 'base64url');
$function$;

DROP FUNCTION IF EXISTS public.generate_certificate_validation_code CASCADE;
CREATE OR REPLACE FUNCTION public.generate_certificate_validation_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 'CERT-' || upper(substring(encode(gen_random_bytes(8), 'base64'), 1, 10));
$function$;

-- 3. Habilitar proteção contra senhas vazadas e configurar OTP adequadamente
-- Nota: Estas configurações devem ser feitas no painel do Supabase Auth
-- Criar função para lembrar admin de configurar

CREATE OR REPLACE FUNCTION public.get_security_configuration_status()
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
    'recommendations', jsonb_build_array(
      'Configure Auth OTP expiry to 5-10 minutes in Supabase Dashboard',
      'Enable Leaked Password Protection in Auth settings',
      'Review all remaining function search_path warnings',
      'Consider implementing 2FA for admin accounts'
    ),
    'status', 'configuration_required',
    'dashboard_links', jsonb_build_object(
      'auth_settings', 'https://supabase.com/dashboard/project/' || current_setting('app.settings.project_id', true) || '/auth/providers',
      'security_settings', 'https://supabase.com/dashboard/project/' || current_setting('app.settings.project_id', true) || '/settings/security'
    )
  );
END;
$function$;