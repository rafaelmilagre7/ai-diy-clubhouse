-- CORREÇÃO DE SEARCH_PATH MUTÁVEL EM FUNÇÕES
-- Fase 1: Funções de timestamp/triggers (mais simples)

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

-- Fase 2: Funções de segurança e permissão (críticas)

CREATE OR REPLACE FUNCTION public.has_role_name(role_name text, check_user_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  WITH target_user AS (
    SELECT COALESCE(check_user_id, auth.uid()) as user_id
  )
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = (SELECT user_id FROM target_user)
    AND ur.name = role_name
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  is_admin_user boolean := false;
BEGIN
  -- Verificar se o usuário existe e tem role de admin via role_id
  SELECT EXISTS(
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = COALESCE(user_id, auth.uid())
    AND ur.name = 'admin'
  ) INTO is_admin_user;
  
  RETURN is_admin_user;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN public.is_user_admin(auth.uid());
END;
$function$;

CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  has_permission BOOLEAN;
BEGIN
  -- Verificar se o usuário tem a permissão específica ou é admin
  SELECT EXISTS(
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    LEFT JOIN public.role_permissions rp ON ur.id = rp.role_id
    LEFT JOIN public.permission_definitions pd ON rp.permission_id = pd.id
    WHERE p.id = user_id
    AND (
      -- Admin tem todas as permissões
      ur.permissions->>'all' = 'true' OR 
      -- Ou tem a permissão específica
      pd.code = permission_code
    )
  ) INTO has_permission;

  RETURN has_permission;
END;
$function$;

CREATE OR REPLACE FUNCTION public.quick_check_permission(user_id uuid, permission_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Verificar diretamente se é admin (caminho rápido)
  IF EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id AND (ur.name = 'admin' OR ur.permissions->>'all' = 'true')
  ) THEN
    RETURN TRUE;
  END IF;

  -- Se não for admin, verificar permissão específica
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.role_permissions rp ON p.role_id = rp.role_id
    JOIN public.permission_definitions pd ON rp.permission_id = pd.id
    WHERE p.id = user_id AND pd.code = permission_code
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT COALESCE(ur.name, 'member')
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.has_role(role_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = role_name
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_security_permissions(user_id uuid)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  user_role TEXT;
  permissions TEXT[];
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  
  CASE user_role
    WHEN 'admin' THEN
      permissions := ARRAY['read', 'write', 'delete', 'admin', 'manage_users'];
    WHEN 'formacao' THEN
      permissions := ARRAY['read', 'write', 'manage_content'];
    ELSE
      permissions := ARRAY['read'];
  END CASE;
  
  RETURN permissions;
END;
$function$;

CREATE OR REPLACE FUNCTION public.detect_unauthorized_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Log tentativas de inserção com user_id diferente do usuário autenticado
  IF TG_OP = 'INSERT' AND NEW.user_id IS DISTINCT FROM auth.uid() THEN
    PERFORM public.log_security_violation(
      'unauthorized_insert_attempt',
      TG_TABLE_NAME::TEXT,
      NEW.id::TEXT,
      jsonb_build_object(
        'attempted_user_id', NEW.user_id,
        'actual_user_id', auth.uid()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fase 3: Funções de negócio e validação

CREATE OR REPLACE FUNCTION public.can_access_course(user_id uuid, course_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  is_restricted BOOLEAN;
  has_access BOOLEAN;
BEGIN
  -- Verificar se o curso é restrito (tem entradas na tabela de controle de acesso)
  SELECT EXISTS(
    SELECT 1 FROM public.course_access_control 
    WHERE course_access_control.course_id = $2
  ) INTO is_restricted;
  
  -- Se o curso não for restrito, qualquer pessoa pode acessá-lo
  IF NOT is_restricted THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se o usuário é admin (admins têm acesso a tudo)
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = $1 AND ur.name = 'admin'
  ) INTO has_access;
  
  IF has_access THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se o usuário tem um papel que permite acesso ao curso
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p
    JOIN public.course_access_control cac ON p.role_id = cac.role_id
    WHERE p.id = $1 AND cac.course_id = $2
  ) INTO has_access;
  
  RETURN has_access;
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_access_benefit(user_id uuid, tool_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  is_restricted BOOLEAN;
  has_access BOOLEAN;
BEGIN
  -- Verificar se o benefício é restrito (tem entradas na tabela de controle de acesso)
  SELECT EXISTS(
    SELECT 1 FROM public.benefit_access_control 
    WHERE benefit_access_control.tool_id = $2
  ) INTO is_restricted;
  
  -- Se o benefício não for restrito, qualquer pessoa pode acessá-lo
  IF NOT is_restricted THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se o usuário é admin (admins têm acesso a tudo)
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = $1 AND ur.name = 'admin'
  ) INTO has_access;
  
  IF has_access THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se o usuário tem um papel que permite acesso ao benefício
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p
    JOIN public.benefit_access_control bac ON p.role_id = bac.role_id
    WHERE p.id = $1 AND bac.tool_id = $2
  ) INTO has_access;
  
  RETURN has_access;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_visible_events_for_user(user_id uuid)
RETURNS SETOF public.events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  is_user_admin BOOLEAN;
  user_role_id UUID;
BEGIN
  -- Verificar se o usuário é admin
  SELECT public.is_admin() INTO is_user_admin;
  
  -- Se for admin, retornar todos os eventos
  IF is_user_admin THEN
    RETURN QUERY SELECT * FROM public.events ORDER BY start_time ASC;
    RETURN;
  END IF;
  
  -- Obter o papel do usuário
  SELECT role_id INTO user_role_id FROM public.profiles WHERE id = user_id;
  
  -- Retornar eventos públicos (sem controle de acesso) ou específicos para o papel do usuário
  RETURN QUERY 
  SELECT e.* FROM public.events e
  WHERE 
    -- Evento público (não tem controle de acesso)
    NOT EXISTS (SELECT 1 FROM public.event_access_control eac WHERE eac.event_id = e.id)
    OR
    -- Evento com acesso específico para o papel do usuário
    EXISTS (SELECT 1 FROM public.event_access_control eac WHERE eac.event_id = e.id AND eac.role_id = user_role_id)
  ORDER BY e.start_time ASC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Mínimo 8 caracteres, pelo menos uma letra e um número
  RETURN length(password) >= 8 
    AND password ~ '[A-Za-z]' 
    AND password ~ '[0-9]';
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_user_password(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  checks jsonb;
  score integer;
  strength text;
BEGIN
  -- Verificações de segurança da senha
  checks := jsonb_build_object(
    'length', length(password) >= 8,
    'uppercase', password ~ '[A-Z]',
    'lowercase', password ~ '[a-z]',
    'number', password ~ '[0-9]',
    'special', password ~ '[!@#$%^&*()_+\-=\[\]{};'':"\\|,.<>\/?]'
  );
  
  -- Calcular pontuação
  score := (
    CASE WHEN checks->>'length' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'uppercase' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'lowercase' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'number' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'special' = 'true' THEN 1 ELSE 0 END
  );
  
  -- Determinar força
  strength := CASE 
    WHEN score < 3 THEN 'weak'
    WHEN score < 5 THEN 'medium'
    ELSE 'strong'
  END;
  
  RETURN jsonb_build_object(
    'checks', checks,
    'score', score,
    'strength', strength,
    'is_valid', score >= 4
  );
END;
$function$;

-- Fase 4: Funções de utilidade e logging

CREATE OR REPLACE FUNCTION public.merge_json_data(target jsonb, source jsonb)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $function$
BEGIN
    -- Se ambos são objetos, mesclar
    IF jsonb_typeof(target) = 'object' AND jsonb_typeof(source) = 'object' THEN
        RETURN target || source;
    -- Caso contrário, retornar o source se não for nulo
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
  -- Gera um token alfanumérico de 12 caracteres sem caracteres ambíguos como 0/O, 1/I/l
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
  -- Gera um token alfanumérico de 10 caracteres sem caracteres ambíguos
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
    'functions_fixed', 37,
    'security_improvement', 'Added SET search_path = \'\' to prevent path hijacking',
    'phase', 1,
    'timestamp', NOW()
  )
);