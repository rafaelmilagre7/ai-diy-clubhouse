-- Recriar secure_assign_role com schema qualificado em TODAS as referências
CREATE OR REPLACE FUNCTION public.secure_assign_role(
  p_admin_user_id uuid,
  p_target_user_id uuid,
  p_new_role_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  admin_check boolean;
  role_exists boolean;
  old_role_id uuid;
  old_role_name text;
  new_role_name text;
  target_user_email text;
BEGIN
  -- 1. Verificar se o admin tem permissão (usando função existente)
  SELECT public.is_user_admin(p_admin_user_id::uuid) INTO admin_check;
  
  IF NOT admin_check THEN
    INSERT INTO public.audit_logs (
      user_id, event_type, action, details, severity
    ) VALUES (
      p_admin_user_id,
      'security_violation',
      'unauthorized_role_change_attempt',
      jsonb_build_object(
        'target_user_id', p_target_user_id,
        'attempted_role_id', p_new_role_id,
        'admin_user_id', p_admin_user_id
      ),
      'high'
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado: apenas administradores'
    );
  END IF;
  
  -- 2. Verificar se o role existe
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles WHERE id = p_new_role_id
  ) INTO role_exists;
  
  IF NOT role_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Role inválido'
    );
  END IF;
  
  -- 3. Buscar informações do usuário alvo e role antigo (SCHEMA QUALIFICADO)
  SELECT 
    p.role_id,
    p.email,
    ur.name
  INTO old_role_id, target_user_email, old_role_name
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = p_target_user_id;
  
  -- 4. Buscar nome do novo role
  SELECT name INTO new_role_name
  FROM public.user_roles
  WHERE id = p_new_role_id;
  
  -- 5. Atualizar o role (SCHEMA QUALIFICADO)
  UPDATE public.profiles
  SET 
    role_id = p_new_role_id,
    updated_at = now()
  WHERE id = p_target_user_id;
  
  -- 6. Registrar no audit log
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    p_admin_user_id,
    'role_change',
    'assign_role',
    jsonb_build_object(
      'target_user_id', p_target_user_id,
      'target_user_email', target_user_email,
      'old_role_id', old_role_id,
      'old_role_name', old_role_name,
      'new_role_id', p_new_role_id,
      'new_role_name', new_role_name,
      'admin_user_id', p_admin_user_id
    ),
    'medium'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Role atualizado com sucesso',
    'old_role', old_role_name,
    'new_role', new_role_name
  );
END;
$$;