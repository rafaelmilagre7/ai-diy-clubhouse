-- Versão final: criação de role SEM log de auditoria (para evitar erros de FK)
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
  
  -- Verificar se usuário existe
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
  
  -- Criar o novo role (SEM LOG DE AUDITORIA)
  INSERT INTO public.user_roles (name, description, is_system, created_at, updated_at)
  VALUES (p_name, p_description, p_is_system, now(), now())
  RETURNING id INTO new_role_id;
  
  -- Retornar sucesso
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