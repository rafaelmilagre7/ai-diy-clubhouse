-- Criar função administrativa para remover membro da equipe
CREATE OR REPLACE FUNCTION public.admin_remove_team_member(
  p_member_id uuid,
  p_organization_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_user_id uuid;
  v_member_exists boolean;
  v_removed_connections integer := 0;
  v_member_name text;
BEGIN
  -- Obter ID do usuário atual
  v_admin_user_id := auth.uid();
  
  -- Verificar se é admin
  IF NOT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = v_admin_user_id AND ur.name = 'admin'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado - apenas administradores'
    );
  END IF;
  
  -- Verificar se o membro existe na organização
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_member_id 
    AND organization_id = p_organization_id
  ) INTO v_member_exists;
  
  IF NOT v_member_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Membro não encontrado na organização'
    );
  END IF;
  
  -- Obter nome do membro para log
  SELECT name INTO v_member_name
  FROM public.profiles
  WHERE id = p_member_id;
  
  -- Remover conexões na tabela member_connections
  DELETE FROM public.member_connections
  WHERE (requester_id = p_member_id OR recipient_id = p_member_id)
  AND (requester_id IN (
    SELECT id FROM public.profiles WHERE organization_id = p_organization_id
  ) OR recipient_id IN (
    SELECT id FROM public.profiles WHERE organization_id = p_organization_id
  ));
  
  GET DIAGNOSTICS v_removed_connections = ROW_COUNT;
  
  -- Remover membro da organização
  UPDATE public.profiles
  SET organization_id = NULL,
      updated_at = now()
  WHERE id = p_member_id;
  
  -- Log da ação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    v_admin_user_id,
    'team_management',
    'member_removed',
    jsonb_build_object(
      'member_id', p_member_id,
      'member_name', v_member_name,
      'organization_id', p_organization_id,
      'removed_connections', v_removed_connections,
      'removed_by', v_admin_user_id
    ),
    'info'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Membro removido com sucesso',
    'removed_connections', v_removed_connections
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Erro ao remover membro: ' || SQLERRM
    );
END;
$$;