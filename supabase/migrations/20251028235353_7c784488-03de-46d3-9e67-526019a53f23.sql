-- ========================================
-- FIX: Eliminar ambiguidade de função is_user_admin
-- ========================================

-- 1. Dropar função sem parâmetro que causa ambiguidade
DROP FUNCTION IF EXISTS public.is_user_admin() CASCADE;

-- 2. Recriar secure_assign_role com cast explícito
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
  -- 1. Verificar se admin_user_id é administrador (COM CAST EXPLÍCITO)
  SELECT public.is_user_admin(p_admin_user_id::uuid) INTO admin_check;
  
  IF NOT admin_check THEN
    -- Registrar tentativa não autorizada
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      p_admin_user_id,
      'security_violation',
      'unauthorized_role_change_attempt',
      jsonb_build_object(
        'target_user_id', p_target_user_id,
        'attempted_role_id', p_new_role_id,
        'admin_check', admin_check
      ),
      'high'
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado: apenas administradores podem alterar roles'
    );
  END IF;
  
  -- 2. Verificar se a role existe
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE id = p_new_role_id
  ) INTO role_exists;
  
  IF NOT role_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Role não encontrada'
    );
  END IF;
  
  -- 3. Buscar informações antigas
  SELECT role_id INTO old_role_id
  FROM public.profiles
  WHERE id = p_target_user_id;
  
  SELECT name INTO old_role_name
  FROM public.user_roles
  WHERE id = old_role_id;
  
  SELECT name INTO new_role_name
  FROM public.user_roles
  WHERE id = p_new_role_id;
  
  SELECT email INTO target_user_email
  FROM public.profiles
  WHERE id = p_target_user_id;
  
  -- 4. Atualizar role no perfil
  UPDATE public.profiles
  SET 
    role_id = p_new_role_id,
    updated_at = now()
  WHERE id = p_target_user_id;
  
  -- 5. Registrar auditoria
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    p_admin_user_id,
    'role_change',
    'admin_changed_user_role',
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
    'message', 'Role alterada com sucesso',
    'old_role', old_role_name,
    'new_role', new_role_name
  );
END;
$$;

-- 3. Garantir que APENAS a função com parâmetro existe
COMMENT ON FUNCTION public.is_user_admin(uuid) IS 
  'Verifica se usuário é admin. ÚNICA versão - sem sobrecarga.';