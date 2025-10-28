-- ============================================
-- CORREÇÃO DEFINITIVA: Passar admin_user_id como parâmetro
-- ============================================

-- 1. Dropar função antiga
DROP FUNCTION IF EXISTS public.secure_assign_role(uuid, uuid) CASCADE;

-- 2. Recriar com parâmetro p_admin_user_id
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
  -- 1. Verificar se quem está chamando é admin
  SELECT public.is_user_admin(p_admin_user_id) INTO admin_check;
  
  IF NOT admin_check THEN
    INSERT INTO public.audit_logs (
      user_id, event_type, action, details, severity
    ) VALUES (
      p_admin_user_id,
      'security_violation',
      'unauthorized_role_change_attempt',
      jsonb_build_object(
        'target_user_id', p_target_user_id,
        'attempted_role_id', p_new_role_id
      ),
      'high'
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado: apenas administradores podem alterar papéis'
    );
  END IF;
  
  -- 2. Validar novo role existe
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles WHERE id = p_new_role_id
  ) INTO role_exists;
  
  IF NOT role_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Papel não encontrado no sistema'
    );
  END IF;
  
  -- 3. Buscar dados atuais
  SELECT 
    p.role_id,
    p.email,
    COALESCE(ur_old.name, 'unknown')
  INTO old_role_id, target_user_email, old_role_name
  FROM public.profiles p
  LEFT JOIN public.user_roles ur_old ON p.role_id = ur_old.id
  WHERE p.id = p_target_user_id;
  
  -- Buscar nome do novo role
  SELECT name INTO new_role_name
  FROM public.user_roles
  WHERE id = p_new_role_id;
  
  -- 4. Atualizar role
  UPDATE public.profiles 
  SET 
    role_id = p_new_role_id,
    updated_at = now()
  WHERE id = p_target_user_id;
  
  -- 5. Audit log
  INSERT INTO public.audit_logs (
    user_id, event_type, action, details, severity
  ) VALUES (
    p_admin_user_id,
    'role_assignment',
    'role_changed',
    jsonb_build_object(
      'target_user_id', p_target_user_id,
      'target_user_email', target_user_email,
      'old_role_id', old_role_id,
      'old_role_name', old_role_name,
      'new_role_id', p_new_role_id,
      'new_role_name', new_role_name,
      'changed_by', p_admin_user_id
    ),
    'info'
  );
  
  -- 6. Retornar sucesso
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Papel atualizado com sucesso',
    'data', jsonb_build_object(
      'target_user_id', p_target_user_id,
      'old_role_name', old_role_name,
      'new_role_name', new_role_name
    )
  );
  
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO public.audit_logs (
      user_id, event_type, action, details, severity
    ) VALUES (
      p_admin_user_id,
      'system_error',
      'role_change_failed',
      jsonb_build_object(
        'error_message', SQLERRM,
        'error_state', SQLSTATE
      ),
      'critical'
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro: ' || SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.secure_assign_role(uuid, uuid, uuid) TO authenticated;