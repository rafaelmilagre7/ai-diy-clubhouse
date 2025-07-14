-- Corrigir problema de registro de usuários com convites
-- Adicionar coluna updated_at à tabela profiles que está faltando

-- 1. Adicionar coluna updated_at à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 2. Atualizar registros existentes que não têm updated_at
UPDATE public.profiles 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- 3. Corrigir a função handle_new_user para funcionar corretamente
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

-- 4. Garantir que o trigger está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Comentários para documentação
COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp da última atualização do perfil';
COMMENT ON FUNCTION public.handle_new_user IS 'Cria perfil automaticamente no signup, incluindo role_id do convite se disponível';