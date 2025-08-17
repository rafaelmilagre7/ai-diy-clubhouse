-- Atualizar função para não falhar se usuário não tiver profile
CREATE OR REPLACE FUNCTION public.secure_create_role_safe(
  p_name text,
  p_description text DEFAULT NULL,
  p_is_system boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_role_id uuid;
  current_user_id uuid;
  user_has_profile boolean;
  result jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado - apenas administradores',
      'error_code', 'ACCESS_DENIED'
    );
  END IF;
  
  -- Obter ID do usuário atual
  current_user_id := auth.uid();
  
  -- Verificar se usuário existe (validação extra)
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Usuário não autenticado',
      'error_code', 'UNAUTHENTICATED'
    );
  END IF;
  
  -- Verificar se role já existe
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE name = p_name) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Um papel com este nome já existe',
      'error_code', 'ROLE_EXISTS'
    );
  END IF;
  
  -- Criar o novo role
  INSERT INTO public.user_roles (name, description, is_system, created_at, updated_at)
  VALUES (p_name, p_description, p_is_system, now(), now())
  RETURNING id INTO new_role_id;
  
  -- Verificar se usuário tem profile antes de logar
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = current_user_id)
  INTO user_has_profile;
  
  -- Log da criação (APENAS se o usuário tiver profile válido)
  IF user_has_profile THEN
    BEGIN
      INSERT INTO public.audit_logs (
        user_id,
        event_type,
        action,
        details,
        severity
      ) VALUES (
        current_user_id,
        'role_management',
        'role_created',
        jsonb_build_object(
          'role_id', new_role_id,
          'role_name', p_name,
          'role_description', p_description,
          'is_system', p_is_system,
          'created_at', now()
        ),
        'info'
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- Se falhar o log, continuar mesmo assim
        NULL;
    END;
  END IF;
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Papel criado com sucesso',
    'role_id', new_role_id,
    'role_name', p_name
  );
  
  RETURN result;
  
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Um papel com este nome já existe',
      'error_code', 'ROLE_EXISTS'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Erro interno: ' || SQLERRM,
      'error_code', 'INTERNAL_ERROR'
    );
END;
$$;