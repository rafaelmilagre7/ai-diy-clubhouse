-- Criar função apply_invite_to_user
-- Esta função é chamada pelo frontend para aplicar convites a usuários registrados

CREATE OR REPLACE FUNCTION public.apply_invite_to_user(
  p_invite_token TEXT,
  p_user_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_invite_record RECORD;
  v_rows_affected INTEGER;
BEGIN
  -- 1. Buscar convite válido (não expirado e não usado)
  SELECT * INTO v_invite_record
  FROM public.invites
  WHERE UPPER(token) = UPPER(TRIM(p_invite_token))
    AND used_at IS NULL
    AND expires_at > NOW()
  LIMIT 1;
  
  -- Se convite não encontrado ou inválido
  IF v_invite_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'invalid_invite',
      'message', 'Convite inválido, expirado ou já utilizado'
    );
  END IF;
  
  -- 2. Atualizar role_id do perfil do usuário
  UPDATE public.profiles
  SET role_id = v_invite_record.role_id,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  
  IF v_rows_affected = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'profile_not_found',
      'message', 'Perfil do usuário não encontrado'
    );
  END IF;
  
  -- 3. Marcar convite como usado
  UPDATE public.invites
  SET used_at = NOW(),
      used_by_user_id = p_user_id
  WHERE id = v_invite_record.id;
  
  -- 4. Log do evento (se tabela audit_logs existir)
  BEGIN
    INSERT INTO public.audit_logs (
      user_id, 
      event_type, 
      action, 
      details
    ) VALUES (
      p_user_id,
      'invite_applied',
      'apply_invite_to_user_rpc',
      jsonb_build_object(
        'invite_id', v_invite_record.id,
        'role_id', v_invite_record.role_id,
        'invite_email', v_invite_record.email
      )
    );
  EXCEPTION
    WHEN undefined_table THEN
      -- Tabela audit_logs não existe, ignorar
      NULL;
  END;
  
  -- 5. Retornar sucesso com detalhes
  RETURN jsonb_build_object(
    'success', true,
    'invite_id', v_invite_record.id,
    'role_id', v_invite_record.role_id,
    'message', 'Convite aplicado com sucesso'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Capturar qualquer erro inesperado
    RETURN jsonb_build_object(
      'success', false,
      'error', 'exception',
      'message', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION public.apply_invite_to_user IS 
'Aplica um convite a um usuário registrado. Valida o token, atualiza o role_id do perfil e marca o convite como usado.';