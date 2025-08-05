-- Corrigir as funções restantes sem search_path
-- Vou corrigir todas as funções principais do sistema que ainda estão com warnings

-- 1. Função para decrementar contadores
CREATE OR REPLACE FUNCTION public.decrement(row_id uuid, table_name text, column_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  EXECUTE format('UPDATE %I SET %I = GREATEST(0, %I - 1) WHERE id = $1', table_name, column_name, column_name)
  USING row_id;
END;
$function$;

-- 2. Função para decrementar upvotes de sugestões
CREATE OR REPLACE FUNCTION public.decrement_suggestion_upvote(suggestion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.decrement(suggestion_id, 'suggestions', 'upvotes');
END;
$function$;

-- 3. Função para verificar rate limit de comentários
CREATE OR REPLACE FUNCTION public.check_comment_rate_limit_secure(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  comment_count integer;
BEGIN
  SELECT COUNT(*) INTO comment_count
  FROM public.learning_comments
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  RETURN comment_count < 10;
END;
$function$;

-- 4. Função para verificar rate limit de NPS
CREATE OR REPLACE FUNCTION public.check_nps_rate_limit_secure(p_user_id uuid, p_lesson_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  nps_count integer;
BEGIN
  SELECT COUNT(*) INTO nps_count
  FROM public.learning_lesson_nps
  WHERE user_id = p_user_id
    AND lesson_id = p_lesson_id
    AND created_at > CURRENT_DATE;
  
  RETURN nps_count = 0;
END;
$function$;

-- 5. Função para verificar acesso de admin
CREATE OR REPLACE FUNCTION public.check_admin_access_secure()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_role text;
  v_is_admin boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT ur.name INTO v_user_role
  FROM profiles p
  INNER JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid();
  
  v_is_admin := (v_user_role = 'admin');
  
  -- Log apenas se usuário autenticado existir
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
      auth.uid(), 'admin_access_check', 'check_admin_access',
      jsonb_build_object('user_role', v_user_role, 'access_granted', v_is_admin),
      CASE WHEN v_is_admin THEN 'info' ELSE 'warning' END
    );
  END IF;
  
  RETURN v_is_admin;
END;
$function$;

-- 6. Função para gerar tokens de referral
CREATE OR REPLACE FUNCTION public.generate_referral_token()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT string_agg(
    substring('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 
    ceil(random() * 32)::integer, 1), '')
  FROM generate_series(1, 10);
$function$;

-- 7. Função para atualizar timestamps de learning lesson nps
CREATE OR REPLACE FUNCTION public.update_learning_lesson_nps_updated_at()
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

-- 8. Função para atualizar timestamps de learning
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