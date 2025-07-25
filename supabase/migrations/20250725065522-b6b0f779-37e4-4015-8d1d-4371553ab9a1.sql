-- CONTINUAÇÃO DA CORREÇÃO DE SEGURANÇA: Lote 3
-- Corrigindo mais 10 funções

-- Função 14: update_learning_lesson_nps_updated_at
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

-- Função 15: create_community_notification
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

-- Função 16: generate_compatibility_score
CREATE OR REPLACE FUNCTION public.generate_compatibility_score(user1_id uuid, user2_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  score numeric := 0.5;
  user1_profile record;
  user2_profile record;
BEGIN
  -- Buscar perfis
  SELECT * INTO user1_profile FROM public.profiles WHERE id = user1_id;
  SELECT * INTO user2_profile FROM public.profiles WHERE id = user2_id;
  
  -- Calcular compatibilidade básica
  IF user1_profile.industry = user2_profile.industry THEN
    score := score + 0.2;
  END IF;
  
  IF user1_profile.company_size = user2_profile.company_size THEN
    score := score + 0.1;
  END IF;
  
  -- Garantir que não exceda 1.0
  IF score > 1.0 THEN
    score := 1.0;
  END IF;
  
  RETURN score;
END;
$function$;

-- Função 17: update_quick_onboarding_updated_at
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

-- Função 18: update_networking_preferences_timestamp
CREATE OR REPLACE FUNCTION public.update_networking_preferences_timestamp()
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

-- Função 19: create_missing_profile_safe
CREATE OR REPLACE FUNCTION public.create_missing_profile_safe(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  default_role_id uuid;
  result jsonb;
BEGIN
  -- Verificar se perfil já existe
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Perfil já existe');
  END IF;
  
  -- Buscar role padrão (com fallback)
  SELECT id INTO default_role_id 
  FROM public.user_roles 
  WHERE name IN ('membro_club', 'member', 'membro') 
  ORDER BY name 
  LIMIT 1;
  
  -- Se não encontrou role padrão, criar um básico
  IF default_role_id IS NULL THEN
    INSERT INTO public.user_roles (name, permissions) 
    VALUES ('member', '{"basic": true}'::jsonb)
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO default_role_id;
  END IF;
  
  -- Criar perfil básico
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role_id,
    onboarding_completed,
    created_at
  ) VALUES (
    target_user_id,
    '', -- Email será preenchido pelo trigger se disponível
    'Usuário',
    default_role_id,
    false,
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Log da criação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details
  ) VALUES (
    target_user_id,
    'profile_creation',
    'auto_create_missing_profile',
    jsonb_build_object(
      'role_id', default_role_id,
      'created_via', 'create_missing_profile_safe'
    )
  );
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Perfil criado com sucesso',
    'role_id', default_role_id
  );
  
  RETURN result;
END;
$function$;

-- Função 20: is_legacy_user
CREATE OR REPLACE FUNCTION public.is_legacy_user(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Lógica simples: usuários criados antes de 2024 são legacy
  -- ou se têm dados específicos que indicam legacy
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND (
      created_at < '2024-01-01'::timestamp 
      OR (role IS NOT NULL AND role != '')
    )
  );
END;
$function$;

-- Função 21: get_user_role_secure
CREATE OR REPLACE FUNCTION public.get_user_role_secure(target_user_id uuid DEFAULT auth.uid())
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role_name text;
  user_email text;
BEGIN
  IF target_user_id IS NULL THEN
    RETURN 'anonymous';
  END IF;
  
  SELECT ur.name INTO user_role_name
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id
  LIMIT 1;
  
  IF user_role_name IS NOT NULL THEN
    RETURN user_role_name;
  END IF;
  
  SELECT p.email INTO user_email
  FROM public.profiles p
  WHERE p.id = target_user_id
  LIMIT 1;
  
  IF user_email IS NOT NULL AND user_email LIKE '%@viverdeia.ai' THEN
    RETURN 'admin';
  END IF;
  
  RETURN 'member';
END;
$function$;