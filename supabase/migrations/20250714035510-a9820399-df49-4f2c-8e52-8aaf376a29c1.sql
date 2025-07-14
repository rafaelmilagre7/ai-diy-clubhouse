-- Corrigir inconsistências de roles e melhorar estrutura

-- 1. Padronizar roles de usuário
UPDATE public.profiles 
SET role_id = (SELECT id FROM public.user_roles WHERE name = 'membro_club' LIMIT 1)
WHERE role_id = (SELECT id FROM public.user_roles WHERE name = 'member' LIMIT 1);

-- 2. Remover role "member" duplicado se existir
DELETE FROM public.user_roles WHERE name = 'member' AND id != (SELECT id FROM public.user_roles WHERE name = 'membro_club' LIMIT 1);

-- 3. Adicionar índices para performance de auth
CREATE INDEX IF NOT EXISTS idx_profiles_email_active ON public.profiles (email) WHERE role_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role_onboarding ON public.profiles (role_id, onboarding_completed);

-- 4. Função para limpeza de sessões órfãs
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleaned_count integer := 0;
BEGIN
  -- Esta função pode ser expandida para limpar sessões órfãs
  -- Por agora apenas conta profiles sem role válido
  SELECT COUNT(*) INTO cleaned_count
  FROM public.profiles p
  WHERE p.role_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.id = p.role_id
  );
  
  RETURN cleaned_count;
END;
$$;

-- 5. Trigger melhorado para evitar profiles órfãos
CREATE OR REPLACE FUNCTION public.validate_profile_role()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar se o role_id existe
  IF NEW.role_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE id = NEW.role_id) THEN
      -- Se o role não existe, usar role padrão
      SELECT id INTO NEW.role_id 
      FROM public.user_roles 
      WHERE name IN ('membro_club', 'membro', 'member') 
      ORDER BY name LIMIT 1;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Aplicar trigger de validação
DROP TRIGGER IF EXISTS validate_profile_role_trigger ON public.profiles;
CREATE TRIGGER validate_profile_role_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_role();

-- 7. Melhorar função de convite para ser mais robusta
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