-- Corrigir problemas de storage e estrutura (parte 2 - funções)

-- 1. Drop e recriar função de validação de convite
DROP FUNCTION IF EXISTS public.validate_invite_token_enhanced(text);

CREATE OR REPLACE FUNCTION public.validate_invite_token_enhanced(p_token text)
RETURNS TABLE(
  id uuid,
  email text,
  role_id uuid,
  token text,
  expires_at timestamp with time zone,
  used_at timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleaned_token text;
BEGIN
  -- Limpar e normalizar o token
  cleaned_token := UPPER(REGEXP_REPLACE(TRIM(p_token), '\s+', '', 'g'));
  
  RETURN QUERY
  SELECT 
    i.id,
    i.email,
    i.role_id,
    i.token,
    i.expires_at,
    i.used_at,
    i.created_at
  FROM public.invites i
  WHERE UPPER(REGEXP_REPLACE(i.token, '\s+', '', 'g')) = cleaned_token
  AND i.expires_at > now()
  ORDER BY i.created_at DESC;
END;
$$;

-- 2. Melhorar função de criação de usuário
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
  -- Log para debug
  RAISE NOTICE 'Novo usuário criado: %', NEW.id;
  
  -- Verificar se há invite_token nos metadados
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    invite_token_from_metadata := NEW.raw_user_meta_data->>'invite_token';
    RAISE NOTICE 'Token de convite encontrado: %', invite_token_from_metadata;
  END IF;
  
  -- Se há token de convite, buscar o role_id correspondente
  IF invite_token_from_metadata IS NOT NULL THEN
    -- Buscar convite válido usando função melhorada
    SELECT i.* INTO invite_record
    FROM public.invites i
    WHERE UPPER(REGEXP_REPLACE(i.token, '\s+', '', 'g')) = UPPER(REGEXP_REPLACE(invite_token_from_metadata, '\s+', '', 'g'))
    AND i.expires_at > now()
    AND i.used_at IS NULL
    LIMIT 1;
    
    IF invite_record.id IS NOT NULL THEN
      user_role_id := invite_record.role_id;
      RAISE NOTICE 'Role encontrado para convite: %', user_role_id;
    ELSE
      RAISE NOTICE 'Convite não encontrado ou inválido';
    END IF;
  END IF;
  
  -- Se não tem role_id do convite, usar role padrão 'member'
  IF user_role_id IS NULL THEN
    SELECT id INTO user_role_id 
    FROM public.user_roles 
    WHERE name IN ('member', 'membro') 
    ORDER BY name LIMIT 1;
    
    IF user_role_id IS NULL THEN
      RAISE NOTICE 'Nenhum role padrão encontrado, criando role member';
      INSERT INTO public.user_roles (name, description, permissions)
      VALUES ('member', 'Membro padrão', '{"basic": true}')
      RETURNING id INTO user_role_id;
    END IF;
  END IF;
  
  -- Criar perfil com role_id correto e tratamento de erro
  BEGIN
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
    );
    
    RAISE NOTICE 'Perfil criado com sucesso para usuário: %', NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    -- Não bloquear a criação do usuário por erro no perfil
  END;
  
  RETURN NEW;
END;
$$;

-- 3. Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Função para limpeza de estado de auth
CREATE OR REPLACE FUNCTION public.cleanup_user_auth_state(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Esta função pode ser usada para limpar estado corrompido
  -- Por agora apenas retorna true, mas pode ser expandida
  RETURN true;
END;
$$;