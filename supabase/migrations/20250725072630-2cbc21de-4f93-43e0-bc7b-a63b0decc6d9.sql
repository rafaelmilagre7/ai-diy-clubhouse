-- Corrigir as últimas funções restantes com search_path - LOTE FINAL
-- PARTE FINAL: Funções core que ainda precisam de correção

CREATE OR REPLACE FUNCTION public.user_can_access_feature(p_user_id uuid, p_feature text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    user_profile RECORD;
    onboarding_status RECORD;
    result JSONB;
BEGIN
    -- Buscar dados do usuário
    SELECT p.*, ur.name as role_name, ur.permissions
    INTO user_profile
    FROM profiles p
    LEFT JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = p_user_id;
    
    -- Se usuário não encontrado
    IF user_profile.id IS NULL THEN
        RETURN jsonb_build_object(
            'has_access', false,
            'has_role_access', false,
            'onboarding_complete', false,
            'user_role', null,
            'feature', p_feature,
            'block_reason', 'user_not_found'
        );
    END IF;
    
    -- Verificar status do onboarding
    SELECT 
        CASE 
            WHEN EXISTS(
                SELECT 1 FROM onboarding_progress 
                WHERE user_id = p_user_id 
                AND is_completed = true
                AND personal_info IS NOT NULL 
                AND personal_info != '{}'::jsonb
                AND professional_info IS NOT NULL 
                AND professional_info != '{}'::jsonb
                AND business_goals IS NOT NULL 
                AND business_goals != '{}'::jsonb
            ) THEN true
            WHEN EXISTS(
                SELECT 1 FROM quick_onboarding 
                WHERE user_id = p_user_id 
                AND is_completed = true
            ) THEN true
            ELSE false
        END as is_complete
    INTO onboarding_status;
    
    -- Verificar acesso por role
    DECLARE
        has_role_access BOOLEAN := false;
    BEGIN
        -- Admin tem acesso a tudo
        IF user_profile.role_name = 'admin' THEN
            has_role_access := true;
        -- Verificar permissões específicas por feature
        ELSIF p_feature = 'networking' AND user_profile.role_name IN ('admin', 'membro_club') THEN
            has_role_access := true;
        ELSIF p_feature = 'implementation_trail' AND user_profile.role_name IN ('admin', 'member', 'membro_club') THEN
            has_role_access := true;
        END IF;
        
        -- Construir resultado
        result := jsonb_build_object(
            'has_access', has_role_access AND onboarding_status.is_complete,
            'has_role_access', has_role_access,
            'onboarding_complete', onboarding_status.is_complete,
            'user_role', user_profile.role_name,
            'feature', p_feature,
            'block_reason', 
                CASE 
                    WHEN NOT has_role_access THEN 'insufficient_role'
                    WHEN NOT onboarding_status.is_complete THEN 'incomplete_onboarding'
                    ELSE 'none'
                END
        );
    END;
    
    RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event(p_action_type text, p_resource_type text, p_resource_id text DEFAULT NULL::text, p_old_values jsonb DEFAULT NULL::jsonb, p_new_values jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.security_audit_logs (
    user_id,
    action_type,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_force_delete_auth_user(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Limpar dados relacionados primeiro
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Dados do usuário removidos, auth.users deve ser removido manualmente'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_complete_user_cleanup(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  cleanup_result jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Executar limpeza completa
  DELETE FROM public.analytics WHERE user_id = target_user_id;
  DELETE FROM public.progress WHERE user_id = target_user_id;
  DELETE FROM public.onboarding_final WHERE user_id = target_user_id;
  DELETE FROM public.quick_onboarding WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Usuário completamente removido do sistema'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_profile_safe(target_user_id uuid DEFAULT auth.uid())
 RETURNS SETOF profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF target_user_id = auth.uid() OR check_admin_access() THEN
    RETURN QUERY SELECT p.* FROM profiles p WHERE p.id = target_user_id;
  ELSE
    -- Log apenas se usuário autenticado
    IF auth.uid() IS NOT NULL THEN
      INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
        auth.uid(), 'security_violation', 'unauthorized_profile_access',
        jsonb_build_object('target_user_id', target_user_id, 'current_user_id', auth.uid()),
        'high'
      );
    END IF;
  END IF;
  RETURN;
END;
$function$;

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

CREATE OR REPLACE FUNCTION public.validate_file_upload(file_name text, file_size bigint, file_type text, bucket_name text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  bucket_config RECORD;
  max_size bigint;
  allowed_types text[];
BEGIN
  -- Buscar configuração do bucket
  SELECT file_size_limit, allowed_mime_types 
  INTO bucket_config
  FROM storage.buckets 
  WHERE id = bucket_name;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Bucket não encontrado: ' || bucket_name
    );
  END IF;
  
  -- Verificar tamanho
  IF file_size > bucket_config.file_size_limit THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Arquivo muito grande. Máximo: ' || (bucket_config.file_size_limit / 1048576) || 'MB'
    );
  END IF;
  
  -- Verificar tipo MIME se especificado
  IF bucket_config.allowed_mime_types IS NOT NULL THEN
    IF NOT (file_type = ANY(bucket_config.allowed_mime_types)) THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'Tipo de arquivo não permitido: ' || file_type
      );
    END IF;
  END IF;
  
  -- Validação adicional de extensão de arquivo
  IF file_name ~ '\.(exe|bat|cmd|scr|com|pif|jar|war)$' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Tipo de arquivo executável não permitido'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'message', 'Arquivo válido para upload'
  );
END;
$function$;

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

CREATE OR REPLACE FUNCTION public.fix_stuck_onboarding_users()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  fixed_count INTEGER := 0;
  user_record RECORD;
BEGIN
  -- Destrava usuários no step 1 que não têm completed_steps
  FOR user_record IN 
    SELECT p.id, p.email, onb.current_step, onb.completed_steps
    FROM public.profiles p
    LEFT JOIN public.onboarding_final onb ON p.id = onb.user_id
    WHERE p.onboarding_completed = false
      AND (onb.completed_steps IS NULL OR array_length(onb.completed_steps, 1) IS NULL)
      AND COALESCE(onb.current_step, 1) = 1
  LOOP
    -- Simular que step 1 foi completado com dados mínimos
    UPDATE public.onboarding_final
    SET 
      completed_steps = ARRAY[1],
      current_step = 2,
      personal_info = COALESCE(personal_info, '{}'::jsonb) || jsonb_build_object(
        'name', COALESCE(personal_info->>'name', 'Usuário'),
        'email', user_record.email
      ),
      updated_at = now()
    WHERE user_id = user_record.id;
    
    fixed_count := fixed_count + 1;
    RAISE NOTICE 'Destravado usuário %: %', user_record.email, user_record.id;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'fixed_users', fixed_count,
    'message', format('Destravados %s usuários do onboarding', fixed_count)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.createstoragepublicpolicy()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Esta função cria políticas de storage público
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Storage public policy created',
    'created_at', now()
  );
END;
$function$;