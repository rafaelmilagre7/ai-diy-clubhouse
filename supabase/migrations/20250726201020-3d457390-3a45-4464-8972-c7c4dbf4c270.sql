-- Criar função is_user_admin que estava faltando
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id 
    AND ur.name = 'admin'
  );
$$;

-- Recrear função secure_assign_role para garantir que funcione
CREATE OR REPLACE FUNCTION public.secure_assign_role(target_user_id uuid, new_role_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_check boolean;
  role_exists boolean;
  current_user_id uuid;
  result jsonb;
BEGIN
  -- Obter ID do usuário atual
  current_user_id := auth.uid();
  
  -- Verificar se o usuário atual é admin
  SELECT public.is_user_admin(current_user_id) INTO admin_check;
  
  IF NOT admin_check THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado: apenas administradores podem alterar papéis'
    );
  END IF;
  
  -- Verificar se o role existe
  SELECT EXISTS(SELECT 1 FROM user_roles WHERE id = new_role_id) INTO role_exists;
  
  IF NOT role_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Papel não encontrado'
    );
  END IF;
  
  -- Atualizar o papel do usuário
  UPDATE profiles 
  SET 
    role_id = new_role_id,
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Registrar no audit log
  INSERT INTO audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    current_user_id,
    'role_assignment',
    'role_changed',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'new_role_id', new_role_id,
      'changed_by', current_user_id,
      'timestamp', now()
    ),
    'info'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Papel atualizado com sucesso'
  );
END;
$$;