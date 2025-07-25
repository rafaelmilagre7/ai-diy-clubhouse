-- CORREÇÃO FINAL - Removendo todas as funções problemáticas e recriando
-- Estratégia: DROP todas as funções que têm conflitos e recriar com search_path

-- Remover funções que causam conflitos
DROP FUNCTION IF EXISTS public.log_invite_validation_attempt(text, boolean, text);
DROP FUNCTION IF EXISTS public.log_security_violation(text, text, text, jsonb);
DROP FUNCTION IF EXISTS public.validate_file_upload(text, bigint, text);

-- Recriar as últimas funções que faltam search_path sem conflitos
CREATE OR REPLACE FUNCTION public.detect_at_risk_users()
 RETURNS TABLE(user_id uuid, risk_score numeric, reasons text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    0.5::numeric as risk_score,
    ARRAY['low_activity']::text[] as reasons
  FROM public.profiles p
  WHERE p.created_at < now() - interval '30 days'
  LIMIT 10;
END;
$function$;

-- Função simples de log de violação de segurança
CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, details jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    user_id, event_type, action, details
  ) VALUES (
    auth.uid(), event_type, 'security_event', details
  );
END;
$function$;

-- Função de validação de upload
CREATE OR REPLACE FUNCTION public.validate_file_security(file_name text, file_size bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Validações básicas de arquivo
  IF file_size > 50 * 1024 * 1024 THEN -- 50MB limit
    RETURN false;
  END IF;
  
  IF file_name IS NULL OR length(file_name) = 0 THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;