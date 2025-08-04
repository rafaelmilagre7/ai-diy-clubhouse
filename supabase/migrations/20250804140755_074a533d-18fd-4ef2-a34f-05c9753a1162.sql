-- =============================================================================
-- CORREÇÃO DOS 21 PROBLEMAS DE SEGURANÇA DETECTADOS PELO LINTER
-- Parte 1: Corrigindo funções sem search_path e views com security definer
-- =============================================================================

-- 1. CORRIGIR FUNÇÕES SEM SEARCH_PATH (Problemas 8-19)
-- Adicionando SET search_path = 'public' nas funções que não têm

-- Função: update_user_checklists_updated_at
CREATE OR REPLACE FUNCTION public.update_user_checklists_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função: update_solution_comments_updated_at
CREATE OR REPLACE FUNCTION public.update_solution_comments_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Função: update_unified_checklists_updated_at
CREATE OR REPLACE FUNCTION public.update_unified_checklists_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função: update_solution_tools_reference_updated_at
CREATE OR REPLACE FUNCTION public.update_solution_tools_reference_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função: update_invite_deliveries_updated_at
CREATE OR REPLACE FUNCTION public.update_invite_deliveries_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função: update_admin_communications_updated_at
CREATE OR REPLACE FUNCTION public.update_admin_communications_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Função: update_learning_lesson_nps_updated_at
CREATE OR REPLACE FUNCTION public.update_learning_lesson_nps_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Função: update_networking_preferences_timestamp
CREATE OR REPLACE FUNCTION public.update_networking_preferences_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função: update_notification_preferences_timestamp_secure
CREATE OR REPLACE FUNCTION public.update_notification_preferences_timestamp_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Função: update_quick_onboarding_updated_at
CREATE OR REPLACE FUNCTION public.update_quick_onboarding_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Função: update_coupons_updated_at
CREATE OR REPLACE FUNCTION public.update_coupons_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Função: update_learning_updated_at
CREATE OR REPLACE FUNCTION public.update_learning_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Função: update_implementation_requests_updated_at
CREATE OR REPLACE FUNCTION public.update_implementation_requests_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função: update_communication_preferences_updated_at
CREATE OR REPLACE FUNCTION public.update_communication_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função: update_network_timestamp
CREATE OR REPLACE FUNCTION public.update_network_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. LOG DA CORREÇÃO DE SEGURANÇA
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_improvement',
  'linter_issues_fixed',
  jsonb_build_object(
    'fixed_functions_search_path', 15,
    'next_steps', ARRAY[
      'Functions search_path security improved',
      'Need to configure Auth OTP expiry in Supabase dashboard',
      'Need to enable leaked password protection in Supabase dashboard'
    ],
    'timestamp', NOW()
  ),
  'info'
);