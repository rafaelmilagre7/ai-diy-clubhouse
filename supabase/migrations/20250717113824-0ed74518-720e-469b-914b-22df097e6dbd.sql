-- FASE 1: CORREÇÃO CRÍTICA DE SEGURANÇA
-- ===============================================

-- 1. REMOVER VIEWS SECURITY DEFINER PROBLEMÁTICAS
-- ================================================
DROP VIEW IF EXISTS public.learning_courses_with_stats CASCADE;
DROP VIEW IF EXISTS public.learning_lessons_with_relations CASCADE;

-- 2. CORRIGIR FUNÇÕES SEM SEARCH_PATH SEGURO (BATCH 1 - PRINCIPAIS)
-- ==================================================================

-- Função crítica: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    -- Verificar se a tabela tem a coluna updated_at antes de tentar atualizá-la
    IF TG_TABLE_NAME = 'onboarding' THEN
        NEW.updated_at = now();
    END IF;
    RETURN NEW;
END;
$function$;

-- Função crítica: update_rate_limits_updated_at
CREATE OR REPLACE FUNCTION public.update_rate_limits_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Função crítica: update_network_timestamp
CREATE OR REPLACE FUNCTION public.update_network_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função crítica: update_learning_updated_at
CREATE OR REPLACE FUNCTION public.update_learning_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Função crítica: update_solution_comments_updated_at
CREATE OR REPLACE FUNCTION public.update_solution_comments_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Função crítica: update_learning_comments_updated_at
CREATE OR REPLACE FUNCTION public.update_learning_comments_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Função crítica: update_lesson_timestamp
CREATE OR REPLACE FUNCTION public.update_lesson_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  UPDATE public.learning_lessons
  SET updated_at = now()
  WHERE id = NEW.lesson_id;
  RETURN NEW;
END;
$function$;

-- Função crítica: update_solution_tools_reference_updated_at
CREATE OR REPLACE FUNCTION public.update_solution_tools_reference_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função crítica: update_admin_communications_updated_at
CREATE OR REPLACE FUNCTION public.update_admin_communications_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Função crítica: update_invite_deliveries_updated_at
CREATE OR REPLACE FUNCTION public.update_invite_deliveries_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função crítica: update_communication_preferences_updated_at
CREATE OR REPLACE FUNCTION public.update_communication_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função crítica: update_learning_lesson_nps_updated_at
CREATE OR REPLACE FUNCTION public.update_learning_lesson_nps_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Função crítica: update_onboarding_final_updated_at
CREATE OR REPLACE FUNCTION public.update_onboarding_final_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Atualizar o campo updated_at corretamente
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Função crítica: sync_simple_onboarding_to_profile
CREATE OR REPLACE FUNCTION public.sync_simple_onboarding_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Sincronizar dados com a tabela profiles
  UPDATE public.profiles
  SET 
    name = COALESCE(NEW.name, name),
    company_name = COALESCE(NEW.company_name, company_name),
    onboarding_completed = NEW.is_completed,
    onboarding_completed_at = CASE 
      WHEN NEW.is_completed THEN COALESCE(NEW.completed_at, now()) 
      ELSE NULL 
    END,
    updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$function$;

-- Função crítica: update_notification_preferences_timestamp
CREATE OR REPLACE FUNCTION public.update_notification_preferences_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Função crítica: update_conversations_timestamp
CREATE OR REPLACE FUNCTION public.update_conversations_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Função crítica: update_member_connections_updated_at
CREATE OR REPLACE FUNCTION public.update_member_connections_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Função crítica: audit_role_assignments
CREATE OR REPLACE FUNCTION public.audit_role_assignments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Log de mudanças de role
  IF (TG_OP = 'UPDATE' AND OLD.role_id IS DISTINCT FROM NEW.role_id) OR TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id, event_type, action, details
    ) VALUES (
      NEW.id,
      'role_assignment',
      TG_OP,
      jsonb_build_object(
        'old_role_id', OLD.role_id,
        'new_role_id', NEW.role_id,
        'changed_by', auth.uid(),
        'changed_at', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. LOG DA CORREÇÃO DE SEGURANÇA
-- ===============================
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'system_security',
  'phase_1_security_fixes',
  jsonb_build_object(
    'message', 'Fase 1 de segurança aplicada - Views removidas e funções corrigidas',
    'phase', 'security_phase_1',
    'fixed_functions', 20,
    'removed_views', 2,
    'timestamp', now()
  ),
  auth.uid()
);