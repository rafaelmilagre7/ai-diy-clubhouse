-- Correção definitiva: Recriar funções com search_path correto

-- 1. Dropar função antiga
DROP FUNCTION IF EXISTS public.secure_assign_role(uuid, uuid);

-- 2. Recriar com configuração de schema correta
CREATE OR REPLACE FUNCTION public.secure_assign_role(
  target_user_id uuid,
  new_role_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  admin_check boolean;
  role_exists boolean;
  current_user_id uuid;
  old_role_id uuid;
  old_role_name text;
  new_role_name text;
  target_user_email text;
  result jsonb;
BEGIN
  -- 1. Obter ID do usuário atual
  current_user_id := auth.uid();
  
  -- 2. Verificar se é admin
  SELECT public.is_user_admin(current_user_id) INTO admin_check;
  
  IF NOT admin_check THEN
    INSERT INTO public.audit_logs (
      user_id, event_type, action, details, severity
    ) VALUES (
      current_user_id,
      'security_violation',
      'unauthorized_role_change_attempt',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'attempted_role_id', new_role_id,
        'timestamp', now()
      ),
      'high'
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado: apenas administradores podem alterar papéis'
    );
  END IF;
  
  -- 3. Validar novo role
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles WHERE id = new_role_id
  ) INTO role_exists;
  
  IF NOT role_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Papel não encontrado no sistema'
    );
  END IF;
  
  -- 4. Buscar dados atuais (usando public. explícito)
  SELECT 
    p.role_id,
    p.email,
    COALESCE(ur_old.name, 'unknown') as old_name
  INTO old_role_id, target_user_email, old_role_name
  FROM public.profiles p
  LEFT JOIN public.user_roles ur_old ON p.role_id = ur_old.id
  WHERE p.id = target_user_id;
  
  -- Buscar nome do novo role
  SELECT name INTO new_role_name
  FROM public.user_roles
  WHERE id = new_role_id;
  
  -- 5. Atualizar role (usando public. explícito)
  UPDATE public.profiles 
  SET 
    role_id = new_role_id,
    updated_at = now()
  WHERE id = target_user_id;
  
  -- 6. Audit log
  INSERT INTO public.audit_logs (
    user_id, event_type, action, details, severity
  ) VALUES (
    current_user_id,
    'role_assignment',
    'role_changed',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'target_user_email', target_user_email,
      'old_role_id', old_role_id,
      'old_role_name', old_role_name,
      'new_role_id', new_role_id,
      'new_role_name', new_role_name,
      'changed_by', current_user_id,
      'timestamp', now()
    ),
    'info'
  );
  
  -- 7. Retornar sucesso
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Papel atualizado com sucesso',
    'data', jsonb_build_object(
      'target_user_id', target_user_id,
      'old_role_name', old_role_name,
      'new_role_name', new_role_name
    )
  );
  
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO public.audit_logs (
      user_id, event_type, action, details, severity
    ) VALUES (
      current_user_id,
      'system_error',
      'role_change_failed',
      jsonb_build_object(
        'error_message', SQLERRM,
        'error_state', SQLSTATE,
        'target_user_id', target_user_id,
        'new_role_id', new_role_id
      ),
      'critical'
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro ao atualizar papel: ' || SQLERRM
    );
END;
$$;

-- Dar permissão para authenticated
GRANT EXECUTE ON FUNCTION public.secure_assign_role(uuid, uuid) TO authenticated;

-- 3. Também corrigir is_user_admin (preventivo)
DROP FUNCTION IF EXISTS public.is_user_admin(uuid);

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id 
    AND ur.name = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO authenticated;