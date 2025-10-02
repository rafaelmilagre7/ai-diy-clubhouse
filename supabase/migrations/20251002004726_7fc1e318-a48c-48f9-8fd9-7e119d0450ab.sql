-- Função para admin adicionar membro à equipe de um master
CREATE OR REPLACE FUNCTION public.admin_add_team_member(
  p_master_user_id uuid,
  p_member_email text,
  p_organization_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_user_id uuid;
  v_member_name text;
  v_connection_exists boolean;
  v_is_admin boolean;
BEGIN
  -- Verificar se o usuário atual é admin
  SELECT EXISTS (
    SELECT 1 
    FROM profiles p
    INNER JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado - apenas administradores podem adicionar membros'
    );
  END IF;
  
  -- Buscar o usuário pelo email
  SELECT id, name INTO v_member_user_id, v_member_name
  FROM profiles
  WHERE LOWER(email) = LOWER(TRIM(p_member_email));
  
  IF v_member_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuário não encontrado com este email'
    );
  END IF;
  
  -- Verificar se já existe uma conexão
  SELECT EXISTS (
    SELECT 1 FROM member_connections
    WHERE (requester_id = p_master_user_id AND recipient_id = v_member_user_id)
       OR (requester_id = v_member_user_id AND recipient_id = p_master_user_id)
  ) INTO v_connection_exists;
  
  IF v_connection_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Este usuário já faz parte da equipe'
    );
  END IF;
  
  -- Criar a conexão
  INSERT INTO member_connections (
    requester_id,
    recipient_id,
    status
  ) VALUES (
    p_master_user_id,
    v_member_user_id,
    'accepted'
  );
  
  -- Atualizar organização do membro
  UPDATE profiles
  SET organization_id = p_organization_id,
      updated_at = now()
  WHERE id = v_member_user_id;
  
  -- Log da operação
  INSERT INTO audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'team_management',
    'member_added',
    jsonb_build_object(
      'master_user_id', p_master_user_id,
      'member_user_id', v_member_user_id,
      'member_email', p_member_email,
      'organization_id', p_organization_id
    ),
    'info'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Membro adicionado com sucesso',
    'member_name', v_member_name,
    'member_id', v_member_user_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro ao adicionar membro: ' || SQLERRM
    );
END;
$$;