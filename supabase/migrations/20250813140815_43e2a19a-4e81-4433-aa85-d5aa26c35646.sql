-- Criar função RPC segura para criação de roles
CREATE OR REPLACE FUNCTION public.secure_create_role(
  p_name text,
  p_description text DEFAULT NULL,
  p_is_system boolean DEFAULT false,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_role_id uuid;
  result jsonb;
BEGIN
  -- Verificar se o usuário é admin
  IF NOT public.is_user_admin_secure(p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado: apenas administradores podem criar roles',
      'error_code', 'UNAUTHORIZED'
    );
  END IF;
  
  -- Validar nome obrigatório
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Nome do role é obrigatório',
      'error_code', 'VALIDATION_ERROR'
    );
  END IF;
  
  -- Verificar se já existe role com esse nome
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE name = trim(p_name)) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Role "%s" já existe', trim(p_name)),
      'error_code', 'DUPLICATE_NAME'
    );
  END IF;
  
  -- Criar o novo role
  INSERT INTO public.user_roles (
    name,
    description,
    is_system,
    created_at,
    updated_at
  ) VALUES (
    trim(p_name),
    p_description,
    p_is_system,
    now(),
    now()
  ) RETURNING id INTO new_role_id;
  
  -- Log da criação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    p_user_id,
    'role_management',
    'secure_create_role',
    new_role_id::text,
    jsonb_build_object(
      'role_name', trim(p_name),
      'description', p_description,
      'is_system', p_is_system,
      'created_via', 'secure_rpc_function'
    ),
    'info'
  );
  
  -- Retornar o role criado
  result := jsonb_build_object(
    'success', true,
    'message', 'Role criado com sucesso',
    'data', jsonb_build_object(
      'id', new_role_id,
      'name', trim(p_name),
      'description', p_description,
      'is_system', p_is_system,
      'created_at', now(),
      'updated_at', now()
    )
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      p_user_id,
      'error',
      'secure_create_role_failed',
      jsonb_build_object(
        'error_message', SQLERRM,
        'error_state', SQLSTATE,
        'role_name', p_name
      ),
      'high'
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Erro interno: %s', SQLERRM),
      'error_code', 'INTERNAL_ERROR'
    );
END;
$function$;