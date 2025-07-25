-- CONTINUAÇÃO DA CORREÇÃO DE SEGURANÇA: Lote 5 (GRANDE)
-- Corrigindo o restante das funções principais

-- Função 34: createstoragepublicpolicy
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

-- Função 35: merge_json_data
CREATE OR REPLACE FUNCTION public.merge_json_data(target jsonb, source jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE SECURITY DEFINER
 SET search_path TO 'public'
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

-- Função 36: get_user_profile_optimized
CREATE OR REPLACE FUNCTION public.get_user_profile_optimized(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  profile_data jsonb;
  role_data jsonb;
BEGIN
  -- Log para debug
  RAISE NOTICE '[PROFILE_OPTIMIZED] Buscando perfil para: %', target_user_id;
  
  -- Buscar dados do perfil (SEM campos de onboarding)
  SELECT jsonb_build_object(
    'id', p.id,
    'email', p.email,
    'name', p.name,
    'company_name', p.company_name,
    'role_id', p.role_id,
    'role', p.role,
    'created_at', p.created_at,
    'updated_at', p.updated_at
  ) INTO profile_data
  FROM public.profiles p
  WHERE p.id = target_user_id;
  
  -- Se não encontrou perfil, retornar null
  IF profile_data IS NULL THEN
    RAISE NOTICE '[PROFILE_OPTIMIZED] Perfil não encontrado para: %', target_user_id;
    RETURN NULL;
  END IF;
  
  -- Buscar dados do role
  SELECT jsonb_build_object(
    'id', ur.id,
    'name', ur.name,
    'description', ur.description,
    'permissions', ur.permissions
  ) INTO role_data
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;
  
  -- Adicionar role_data ao perfil
  IF role_data IS NOT NULL THEN
    profile_data := profile_data || jsonb_build_object('user_roles', role_data);
    RAISE NOTICE '[PROFILE_OPTIMIZED] Role encontrado: %', role_data->>'name';
  ELSE
    profile_data := profile_data || jsonb_build_object('user_roles', null);
    RAISE NOTICE '[PROFILE_OPTIMIZED] Role não encontrado para: %', target_user_id;
  END IF;
  
  RAISE NOTICE '[PROFILE_OPTIMIZED] Retornando perfil completo para: %', profile_data->>'email';
  RETURN profile_data;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '[PROFILE_OPTIMIZED] ERRO: % para usuário %', SQLERRM, target_user_id;
    RETURN NULL;
END;
$function$;

-- Função 37: is_admin_user
CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.is_user_admin(auth.uid());
$function$;

-- Função 38: update_notification_preferences_timestamp
CREATE OR REPLACE FUNCTION public.update_notification_preferences_timestamp()
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

-- Função 39: update_user_progress
CREATE OR REPLACE FUNCTION public.update_user_progress(p_user_id uuid, p_lesson_id uuid, p_progress_data jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  progress_record record;
BEGIN
  -- Inserir ou atualizar progresso
  INSERT INTO public.learning_progress (
    user_id,
    lesson_id,
    progress_data,
    last_accessed_at
  ) VALUES (
    p_user_id,
    p_lesson_id,
    p_progress_data,
    now()
  )
  ON CONFLICT (user_id, lesson_id) 
  DO UPDATE SET
    progress_data = EXCLUDED.progress_data,
    last_accessed_at = now(),
    updated_at = now();
  
  RETURN jsonb_build_object(
    'success', true,
    'updated_at', now()
  );
END;
$function$;

-- Função 40: toggle_topic_solved
CREATE OR REPLACE FUNCTION public.toggle_topic_solved(p_topic_id uuid, p_user_id uuid DEFAULT auth.uid())
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  topic_author_id uuid;
  current_solved boolean;
  result jsonb;
BEGIN
  -- Verificar se o usuário é o autor do tópico ou admin
  SELECT user_id, is_solved INTO topic_author_id, current_solved
  FROM community_topics
  WHERE id = p_topic_id;
  
  IF topic_author_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tópico não encontrado'
    );
  END IF;
  
  IF p_user_id != topic_author_id AND NOT is_user_admin_secure(p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Apenas o autor do tópico pode marcá-lo como resolvido'
    );
  END IF;
  
  -- Alternar status
  UPDATE community_topics
  SET is_solved = NOT current_solved,
      updated_at = NOW()
  WHERE id = p_topic_id;
  
  result := jsonb_build_object(
    'success', true,
    'topic_id', p_topic_id,
    'is_solved', NOT current_solved,
    'message', CASE 
      WHEN NOT current_solved THEN 'Tópico marcado como resolvido'
      ELSE 'Tópico desmarcado como resolvido'
    END
  );
  
  RETURN result;
END;
$function$;

-- Função 41: create_invite_hybrid
CREATE OR REPLACE FUNCTION public.create_invite_hybrid(p_email text, p_role_id uuid, p_phone text DEFAULT NULL::text, p_expires_in text DEFAULT '7 days'::text, p_notes text DEFAULT NULL::text, p_channel_preference text DEFAULT 'email'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_token text;
  v_invite_id uuid;
  v_expires_at timestamp with time zone;
  v_result jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Acesso negado - apenas administradores podem criar convites'
    );
  END IF;
  
  -- Verificar se email já foi convidado recentemente
  IF EXISTS (
    SELECT 1 FROM public.invites 
    WHERE email = p_email 
    AND expires_at > now() 
    AND used_at IS NULL
  ) THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Email já possui convite pendente'
    );
  END IF;
  
  -- Gerar token único
  v_token := public.generate_invite_token();
  
  -- Calcular data de expiração
  v_expires_at := now() + p_expires_in::interval;
  
  -- Inserir convite
  INSERT INTO public.invites (
    email,
    role_id,
    token,
    expires_at,
    created_by,
    notes,
    whatsapp_number,
    preferred_channel
  ) VALUES (
    p_email,
    p_role_id,
    v_token,
    v_expires_at,
    auth.uid(),
    p_notes,
    p_phone,
    p_channel_preference
  ) RETURNING id INTO v_invite_id;
  
  -- Retornar dados do convite
  v_result := jsonb_build_object(
    'status', 'success',
    'invite_id', v_invite_id,
    'token', v_token,
    'expires_at', v_expires_at,
    'email', p_email,
    'phone', p_phone,
    'channel_preference', p_channel_preference,
    'message', 'Convite criado com sucesso'
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Erro ao criar convite: ' || SQLERRM
    );
END;
$function$;