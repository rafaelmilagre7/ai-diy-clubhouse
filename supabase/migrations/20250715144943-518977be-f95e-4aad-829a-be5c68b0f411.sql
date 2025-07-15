-- Remover função existente para permitir mudança de tipo
DROP FUNCTION IF EXISTS public.use_invite_with_onboarding(text, uuid);

-- Recriar função use_invite_with_onboarding com retorno correto
CREATE OR REPLACE FUNCTION public.use_invite_with_onboarding(invite_token text, user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record public.invites;
  cleaned_token text;
  role_record public.user_roles;
  onboarding_result jsonb;
  invite_data jsonb;
BEGIN
  -- Limpar o token
  cleaned_token := upper(regexp_replace(invite_token, '\s+', '', 'g'));
  
  RAISE NOTICE 'Aplicando convite % para usuário %', left(cleaned_token, 8) || '***', user_id;
  
  -- Buscar convite válido
  SELECT * INTO invite_record
  FROM public.invites
  WHERE upper(regexp_replace(token, '\s+', '', 'g')) = cleaned_token
  AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Verificar se encontrou o convite
  IF invite_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'token_not_found',
      'message', 'Token de convite não encontrado ou expirado'
    );
  END IF;
  
  -- Verificar se já foi usado
  IF invite_record.used_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'already_used',
      'message', 'Token de convite já foi utilizado'
    );
  END IF;
  
  -- Buscar informações do role
  SELECT * INTO role_record FROM public.user_roles WHERE id = invite_record.role_id;
  
  -- Criar/atualizar perfil com dados do convite
  INSERT INTO public.profiles (id, email, role_id, name, created_at, updated_at)
  VALUES (
    user_id,
    invite_record.email,
    invite_record.role_id,
    CASE 
      WHEN invite_record.notes ~ '^[A-Za-zÀ-ÿ\s]{2,50}$' THEN invite_record.notes
      ELSE NULL
    END,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    role_id = invite_record.role_id,
    email = EXCLUDED.email,
    name = COALESCE(profiles.name, EXCLUDED.name),
    updated_at = now();
  
  -- Marcar convite como usado
  UPDATE public.invites
  SET used_at = now()
  WHERE id = invite_record.id;
  
  -- Preparar dados do convite para o onboarding
  invite_data := jsonb_build_object(
    'email', invite_record.email,
    'from_invite', true
  );
  
  IF invite_record.whatsapp_number IS NOT NULL THEN
    invite_data := invite_data || jsonb_build_object(
      'phone', invite_record.whatsapp_number,
      'phone_from_invite', true
    );
  END IF;
  
  IF invite_record.notes IS NOT NULL AND invite_record.notes ~ '^[A-Za-zÀ-ÿ\s]{2,50}$' THEN
    invite_data := invite_data || jsonb_build_object(
      'name', invite_record.notes,
      'name_from_invite', true
    );
  END IF;
  
  -- Inicializar onboarding com dados do convite
  SELECT public.initialize_onboarding_for_user(user_id, invite_data) INTO onboarding_result;
  
  RAISE NOTICE 'Convite aplicado e onboarding inicializado para usuário %', user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Convite aplicado e onboarding inicializado com sucesso',
    'invite_id', invite_record.id,
    'role_id', invite_record.role_id,
    'role_name', role_record.name,
    'onboarding_result', onboarding_result,
    'invite_data_preloaded', invite_data
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao aplicar convite: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro interno ao aplicar convite: ' || SQLERRM
    );
END;
$$;