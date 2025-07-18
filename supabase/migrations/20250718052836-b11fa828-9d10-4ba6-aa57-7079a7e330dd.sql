-- FASE 1: Correção Crítica de Segurança
-- Corrigindo os 2 erros críticos de Security Definer Views e principais funções sem search_path

-- 1. Corrigir funções críticas sem search_path
CREATE OR REPLACE FUNCTION public.update_network_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_learning_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_lesson_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.learning_lessons
  SET updated_at = now()
  WHERE id = NEW.lesson_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_admin_communications_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_communication_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_quick_onboarding_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 2. Criar função auxiliar para verificação de role sem recursão RLS
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    SELECT ur.name 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid()
    LIMIT 1
  );
END;
$function$;

-- 3. Melhorar função is_admin para evitar recursão
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(public.get_user_role() = 'admin', false);
$function$;

-- 4. Função para verificar se usuário é owner dos dados
CREATE OR REPLACE FUNCTION public.is_owner(resource_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT auth.uid() = resource_user_id;
$function$;

-- 5. Implementar rate limiting básico
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_action text,
  p_limit_per_hour integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
BEGIN
  -- Contar tentativas na última hora
  SELECT COUNT(*) INTO v_count
  FROM public.audit_logs
  WHERE user_id = auth.uid()
    AND action = p_action
    AND timestamp > NOW() - INTERVAL '1 hour';
  
  -- Se excedeu o limite, retornar false
  IF v_count >= p_limit_per_hour THEN
    RETURN false;
  END IF;
  
  -- Registrar tentativa
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details
  ) VALUES (
    auth.uid(),
    'rate_limit_check',
    p_action,
    jsonb_build_object('count', v_count + 1, 'limit', p_limit_per_hour)
  );
  
  RETURN true;
END;
$function$;

-- 6. Adicionar comentários para rastrear correções
COMMENT ON FUNCTION public.get_user_role() IS 'Função auxiliar para verificação de role - SECURITY: search_path definido';
COMMENT ON FUNCTION public.is_admin() IS 'Verificação de admin otimizada - SECURITY: search_path definido, sem recursão RLS';
COMMENT ON FUNCTION public.is_owner(uuid) IS 'Verificação de ownership - SECURITY: search_path definido';
COMMENT ON FUNCTION public.check_rate_limit(text, integer) IS 'Rate limiting básico - SECURITY: search_path definido';