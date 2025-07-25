-- Continuar corrigindo triggers restantes sem afetar funcionalidade

CREATE OR REPLACE FUNCTION public.update_suggestions_updated_at_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_suggestion_comments_updated_at_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_solution_certificates_updated_at_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_quick_onboarding_updated_at_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Funções de verificação de limites (rate limiting)
CREATE OR REPLACE FUNCTION public.check_comment_rate_limit_secure(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  comment_count integer;
BEGIN
  SELECT COUNT(*) INTO comment_count
  FROM public.learning_comments
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  RETURN comment_count < 10;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_nps_rate_limit_secure(p_user_id uuid, p_lesson_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Função de verificação de admin otimizada
CREATE OR REPLACE FUNCTION public.check_admin_access_secure()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;