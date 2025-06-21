
-- Correção do fluxo de convites - Parte 1: Funções do banco de dados
-- ================================================================

-- 1. Primeiro, vamos verificar e corrigir a função use_invite para ser mais robusta
CREATE OR REPLACE FUNCTION public.use_invite(invite_token text, user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record public.invites;
  user_profile_record public.profiles;
  result_status text;
  result_message text;
  cleaned_token text;
  debug_info jsonb;
BEGIN
  -- Limpar o token (remover espaços, converter para maiúsculas)
  cleaned_token := upper(regexp_replace(invite_token, '\s+', '', 'g'));
  
  -- Log para depuração
  RAISE NOTICE 'Tentando usar convite com token: % para usuário: %', cleaned_token, user_id;
  
  -- Verificar se o usuário realmente existe na tabela profiles
  SELECT * INTO user_profile_record
  FROM public.profiles
  WHERE id = user_id;
  
  IF user_profile_record.id IS NULL THEN
    RAISE NOTICE 'Usuário % não encontrado na tabela profiles', user_id;
    RETURN json_build_object(
      'status', 'error', 
      'message', 'Usuário não encontrado. Complete o registro primeiro.'
    );
  END IF;
  
  -- Buscar convite válido
  SELECT * INTO invite_record
  FROM public.invites
  WHERE upper(token) = cleaned_token
  AND used_at IS NULL
  AND expires_at > now();
  
  -- Se não encontrou, tenta busca parcial
  IF invite_record.id IS NULL AND length(cleaned_token) >= 8 THEN
    SELECT * INTO invite_record
    FROM public.invites
    WHERE upper(token) ILIKE (substring(cleaned_token from 1 for 8) || '%')
    AND used_at IS NULL
    AND expires_at > now()
    LIMIT 1;
  END IF;
  
  -- Verificar se o convite existe e é válido
  IF invite_record.id IS NULL THEN
    result_status := 'error';
    result_message := 'Convite inválido ou expirado';
    
    RETURN json_build_object(
      'status', result_status, 
      'message', result_message
    );
  END IF;
  
  -- Verificar se o convite já foi usado (double-check)
  IF invite_record.used_at IS NOT NULL THEN
    result_status := 'error';
    result_message := 'Este convite já foi utilizado';
    
    RETURN json_build_object(
      'status', result_status, 
      'message', result_message
    );
  END IF;
  
  -- TRANSAÇÃO: Marcar o convite como utilizado E atualizar o papel do usuário
  BEGIN
    -- Marcar o convite como utilizado
    UPDATE public.invites
    SET used_at = now()
    WHERE id = invite_record.id;
    
    -- Atualizar o papel do usuário
    UPDATE public.profiles
    SET role_id = invite_record.role_id
    WHERE id = user_id;
    
    -- Registrar a alteração no log de auditoria
    PERFORM public.log_permission_change(
      user_id := user_id,
      action_type := 'use_invite',
      target_user_id := user_id,
      role_id := invite_record.role_id
    );
    
    result_status := 'success';
    result_message := 'Convite utilizado com sucesso';
    
    RAISE NOTICE 'Convite % aplicado com sucesso para usuário %', cleaned_token, user_id;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Em caso de erro, reverter
      RAISE NOTICE 'Erro ao aplicar convite: %', SQLERRM;
      result_status := 'error';
      result_message := 'Erro interno ao aplicar convite: ' || SQLERRM;
  END;
  
  RETURN json_build_object(
    'status', result_status, 
    'message', result_message, 
    'invite_id', invite_record.id,
    'role_id', invite_record.role_id
  );
END;
$$;

-- 2. Criar função para verificar se o trigger automático existe e removê-lo se necessário
DO $$
DECLARE
  trigger_exists BOOLEAN;
BEGIN
  -- Verificar se existe trigger que marca convite automaticamente
  SELECT EXISTS(
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created' 
    AND event_object_table = 'users'
    AND event_object_schema = 'auth'
  ) INTO trigger_exists;
  
  IF trigger_exists THEN
    RAISE NOTICE 'Trigger on_auth_user_created encontrado - verificando se marca convites automaticamente';
    
    -- Se o trigger existe, vamos verificar sua função
    -- Por segurança, vamos criar uma versão que NÃO marca convites automaticamente
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = ''
    AS $func$
    BEGIN
      -- Inserir perfil básico sem processar convites automaticamente
      INSERT INTO public.profiles (
        id, 
        email, 
        name, 
        created_at,
        onboarding_completed
      )
      VALUES (
        new.id, 
        new.email, 
        COALESCE(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
        now(),
        false
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, profiles.name);
      
      -- NÃO processar convites aqui - isso será feito manualmente no frontend
      -- após confirmação de que o usuário foi criado com sucesso
      
      RETURN new;
    END;
    $func$;
    
    RAISE NOTICE 'Função handle_new_user atualizada para NÃO processar convites automaticamente';
  END IF;
END;
$$;

-- 3. Criar função auxiliar para verificar se um usuário pode usar um convite
CREATE OR REPLACE FUNCTION public.can_use_invite(invite_token text, user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record public.invites;
  cleaned_token text;
BEGIN
  -- Limpar o token
  cleaned_token := upper(regexp_replace(invite_token, '\s+', '', 'g'));
  
  -- Buscar convite
  SELECT * INTO invite_record
  FROM public.invites
  WHERE upper(token) = cleaned_token
  AND used_at IS NULL
  AND expires_at > now();
  
  -- Se não encontrou, tenta busca parcial
  IF invite_record.id IS NULL AND length(cleaned_token) >= 8 THEN
    SELECT * INTO invite_record
    FROM public.invites
    WHERE upper(token) ILIKE (substring(cleaned_token from 1 for 8) || '%')
    AND used_at IS NULL
    AND expires_at > now()
    LIMIT 1;
  END IF;
  
  IF invite_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Convite inválido ou expirado'
    );
  END IF;
  
  -- Verificar se o email confere
  IF invite_record.email != user_email THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Este convite não foi enviado para este email'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'invite_id', invite_record.id,
    'email', invite_record.email,
    'role_id', invite_record.role_id,
    'expires_at', invite_record.expires_at
  );
END;
$$;

-- 4. Comentários explicativos
COMMENT ON FUNCTION public.use_invite(text, uuid) IS 'Aplica convite APENAS após o usuário estar criado na tabela profiles';
COMMENT ON FUNCTION public.can_use_invite(text, text) IS 'Verifica se um convite pode ser usado por um email específico';
COMMENT ON FUNCTION public.handle_new_user() IS 'Cria perfil básico SEM processar convites automaticamente';
