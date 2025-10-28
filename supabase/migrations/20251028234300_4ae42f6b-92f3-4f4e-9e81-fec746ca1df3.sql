
-- ============================================
-- CORREÇÃO FINAL: Usar schema ABSOLUTO em todos os lugares
-- ============================================

-- 1. Dropar função completamente
DROP FUNCTION IF EXISTS public.secure_assign_role(uuid, uuid) CASCADE;

-- 2. Recriar com schema ABSOLUTO em CADA referência
CREATE OR REPLACE FUNCTION public.secure_assign_role(
  target_user_id uuid,
  new_role_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''  -- ✅ CRÍTICO: Forçar schema absoluto
AS $$
DECLARE
  admin_check boolean;
  role_exists boolean;
  current_user_id uuid;
  old_role_id uuid;
  old_role_name text;
  new_role_name text;
  target_user_email text;
BEGIN
  -- 1. Obter ID do usuário atual (schema absoluto)
  current_user_id := auth.uid();
  
  -- 2. Verificar se é admin (schema absoluto)
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
  
  -- 3. Validar novo role (schema absoluto)
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles WHERE id = new_role_id
  ) INTO role_exists;
  
  IF NOT role_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Papel não encontrado no sistema'
    );
  END IF;
  
  -- 4. Buscar dados atuais (schema ABSOLUTO)
  SELECT 
    p.role_id,
    p.email,
    COALESCE(ur_old.name, 'unknown')
  INTO old_role_id, target_user_email, old_role_name
  FROM public.profiles p
  LEFT JOIN public.user_roles ur_old ON p.role_id = ur_old.id
  WHERE p.id = target_user_id;
  
  -- Buscar nome do novo role (schema absoluto)
  SELECT name INTO new_role_name
  FROM public.user_roles
  WHERE id = new_role_id;
  
  -- 5. Atualizar role (schema ABSOLUTO)
  UPDATE public.profiles 
  SET 
    role_id = new_role_id,
    updated_at = now()
  WHERE id = target_user_id;
  
  -- 6. Audit log (schema absoluto)
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
      'message', 'Erro: ' || SQLERRM
    );
END;
$$;

-- 3. Dar permissões
GRANT EXECUTE ON FUNCTION public.secure_assign_role(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.secure_assign_role(uuid, uuid) TO anon;

-- 4. Também atualizar is_user_admin com schema absoluto
DROP FUNCTION IF EXISTS public.is_user_admin(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''  -- ✅ CRÍTICO: Forçar schema absoluto
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = $1
    AND ur.name = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO anon;
