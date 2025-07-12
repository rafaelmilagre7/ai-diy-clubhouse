-- CORREÇÃO DE SEARCH_PATH MUTÁVEL EM FUNÇÕES - FASE 1
-- Adicionando SET search_path = '' para proteção contra path hijacking

-- Funções de timestamp/triggers
CREATE OR REPLACE FUNCTION public.update_rate_limits_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_network_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_learning_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_solution_comments_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_learning_comments_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_lesson_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.learning_lessons
  SET updated_at = now()
  WHERE id = NEW.lesson_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_onboarding_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_solution_tools_reference_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_admin_communications_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_invite_deliveries_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_communication_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_learning_lesson_nps_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_notification_preferences_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_conversations_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_member_connections_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Funções de utilidade
CREATE OR REPLACE FUNCTION public.merge_json_data(target jsonb, source jsonb)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $function$
BEGIN
    IF jsonb_typeof(target) = 'object' AND jsonb_typeof(source) = 'object' THEN
        RETURN target || source;
    ELSIF source IS NOT NULL THEN
        RETURN source;
    ELSE
        RETURN target;
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS text
LANGUAGE sql
SET search_path = ''
AS $function$
  SELECT string_agg(
    substring('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 
    ceil(random() * 32)::integer, 1), '')
  FROM generate_series(1, 12);
$function$;

CREATE OR REPLACE FUNCTION public.generate_certificate_validation_code()
RETURNS text
LANGUAGE sql
SET search_path = ''
AS $function$
  SELECT string_agg(
    substring('ABCDEFGHJKMNPQRSTUVWXYZ0123456789', 
    ceil(random() * 34)::integer, 1), '')
  FROM generate_series(1, 12);
$function$;

CREATE OR REPLACE FUNCTION public.generate_referral_token()
RETURNS text
LANGUAGE sql
SET search_path = ''
AS $function$
  SELECT string_agg(
    substring('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 
    ceil(random() * 32)::integer, 1), '')
  FROM generate_series(1, 10);
$function$;

-- Log da correção
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  auth.uid(),
  'security_fix',
  'function_search_path_fix_phase1',
  jsonb_build_object(
    'functions_fixed', 20,
    'security_improvement', 'Added SET search_path = empty to prevent path hijacking',
    'phase', 1,
    'timestamp', NOW()
  )
);