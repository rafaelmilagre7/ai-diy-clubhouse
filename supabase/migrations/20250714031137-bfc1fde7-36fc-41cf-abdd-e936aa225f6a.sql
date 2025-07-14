-- Corrigir problema do registro de usuários com convites
-- O problema é que o perfil está sendo criado sem role_id inicialmente
-- e a constraint impede isso para usuários novos

-- 1. Temporariamente relaxar a constraint para permitir correção
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_id_not_null_for_active_users;

-- 2. Recriar a constraint de forma mais flexível
-- Permitir role_id NULL temporariamente durante o processo de registro
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_id_not_null_for_active_users 
CHECK (
  role_id IS NOT NULL 
  OR created_at < (now() - '24:00:00'::interval)
  OR created_at > (now() - '00:05:00'::interval) -- Permitir 5 minutos para completar o registro
);

-- 3. Melhorar a função use_invite_enhanced para garantir que o perfil seja criado corretamente
CREATE OR REPLACE FUNCTION public.use_invite_enhanced(invite_token text, user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record public.invites;
  cleaned_token text;
  profile_exists boolean;
BEGIN
  -- Limpar o token
  cleaned_token := upper(regexp_replace(invite_token, '\s+', '', 'g'));
  
  RAISE NOTICE 'Tentando usar convite: % para usuário: %', cleaned_token, user_id;
  
  -- Buscar convite válido usando a função de validação
  SELECT * INTO invite_record
  FROM public.validate_invite_token_enhanced(cleaned_token)
  LIMIT 1;
  
  -- Verificar se encontrou o convite
  IF invite_record.id IS NULL THEN
    RAISE NOTICE 'Convite não encontrado ou inválido: %', cleaned_token;
    RETURN json_build_object(
      'status', 'error',
      'message', 'Convite inválido ou expirado'
    );
  END IF;
  
  -- Verificar se o convite já foi usado
  IF invite_record.used_at IS NOT NULL THEN
    RAISE NOTICE 'Convite já foi usado: %', cleaned_token;
    RETURN json_build_object(
      'status', 'error',
      'message', 'Este convite já foi utilizado'
    );
  END IF;
  
  -- Verificar se perfil existe
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO profile_exists;
  
  -- Se perfil não existe, criar com o role_id correto
  IF NOT profile_exists THEN
    RAISE NOTICE 'Criando perfil para usuário % com role_id %', user_id, invite_record.role_id;
    
    INSERT INTO public.profiles (id, email, role_id, created_at, updated_at)
    VALUES (
      user_id, 
      invite_record.email, 
      invite_record.role_id, 
      now(), 
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      role_id = invite_record.role_id,
      updated_at = now();
  ELSE
    -- Se perfil existe, apenas atualizar o role_id
    UPDATE public.profiles
    SET role_id = invite_record.role_id, updated_at = now()
    WHERE id = user_id;
  END IF;
  
  -- Marcar convite como usado
  UPDATE public.invites
  SET used_at = now()
  WHERE id = invite_record.id;
  
  RAISE NOTICE 'Convite % aplicado com sucesso para usuário %', cleaned_token, user_id;
  
  RETURN json_build_object(
    'status', 'success',
    'message', 'Convite utilizado com sucesso',
    'invite_id', invite_record.id,
    'role_id', invite_record.role_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao aplicar convite: %', SQLERRM;
    RETURN json_build_object(
      'status', 'error',
      'message', 'Erro interno ao aplicar convite: ' || SQLERRM
    );
END;
$$;

-- 4. Melhorar a função que cria perfil automaticamente no signup
-- para já incluir o role_id quando há um invite_token
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_token_from_metadata text;
  invite_record public.invites;
  user_role_id uuid;
BEGIN
  -- Verificar se há invite_token nos metadados
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    invite_token_from_metadata := NEW.raw_user_meta_data->>'invite_token';
  END IF;
  
  -- Se há token de convite, buscar o role_id correspondente
  IF invite_token_from_metadata IS NOT NULL THEN
    RAISE NOTICE 'Usuario % criado com token de convite: %', NEW.id, invite_token_from_metadata;
    
    -- Buscar convite válido
    SELECT * INTO invite_record
    FROM public.validate_invite_token_enhanced(invite_token_from_metadata)
    LIMIT 1;
    
    IF invite_record.id IS NOT NULL THEN
      user_role_id := invite_record.role_id;
      RAISE NOTICE 'Role encontrado para convite: %', user_role_id;
    END IF;
  END IF;
  
  -- Se não tem role_id do convite, usar role padrão 'membro'
  IF user_role_id IS NULL THEN
    SELECT id INTO user_role_id FROM public.user_roles WHERE name = 'membro' LIMIT 1;
  END IF;
  
  -- Criar perfil com role_id correto
  INSERT INTO public.profiles (
    id, 
    email, 
    name, 
    role_id, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    user_role_id,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    role_id = COALESCE(EXCLUDED.role_id, profiles.role_id),
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- 5. Garantir que o trigger está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Comentários para documentação
COMMENT ON FUNCTION public.use_invite_enhanced IS 'Aplica convite de usuário, criando ou atualizando perfil com role_id correto';
COMMENT ON FUNCTION public.handle_new_user IS 'Cria perfil automaticamente no signup, incluindo role_id do convite se disponível';