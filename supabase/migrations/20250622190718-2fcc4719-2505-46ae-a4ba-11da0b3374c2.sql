
-- FASE 1: Criar função e trigger para aplicação automática de convites
-- =====================================================================

-- Função para aplicar convite automaticamente durante criação do usuário
CREATE OR REPLACE FUNCTION public.apply_invite_on_user_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_token_value TEXT;
  invite_record public.invites;
  user_metadata JSONB;
BEGIN
  -- Extrair metadados do usuário
  user_metadata := NEW.raw_user_meta_data;
  
  -- Verificar se há um invite_token nos metadados
  invite_token_value := user_metadata->>'invite_token';
  
  -- Se não há token, não fazer nada
  IF invite_token_value IS NULL OR invite_token_value = '' THEN
    RETURN NEW;
  END IF;
  
  -- Limpar o token (remover espaços, converter para maiúsculas)
  invite_token_value := upper(regexp_replace(invite_token_value, '\s+', '', 'g'));
  
  -- Buscar convite válido
  SELECT * INTO invite_record
  FROM public.invites
  WHERE upper(token) = invite_token_value
  AND used_at IS NULL
  AND expires_at > now();
  
  -- Se convite não encontrado, tentar busca parcial
  IF invite_record.id IS NULL AND length(invite_token_value) >= 8 THEN
    SELECT * INTO invite_record
    FROM public.invites
    WHERE upper(token) ILIKE (substring(invite_token_value from 1 for 8) || '%')
    AND used_at IS NULL
    AND expires_at > now()
    LIMIT 1;
  END IF;
  
  -- Se encontrou convite válido, aplicar
  IF invite_record.id IS NOT NULL THEN
    -- Marcar convite como usado
    UPDATE public.invites
    SET used_at = now()
    WHERE id = invite_record.id;
    
    -- Aguardar criação do perfil e depois atualizar role
    -- Isso será feito via trigger na tabela profiles
    
    -- Log da operação
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      resource_id,
      details
    ) VALUES (
      NEW.id,
      'invite_applied',
      'auto_apply_invite',
      invite_record.id::TEXT,
      jsonb_build_object(
        'invite_token', invite_token_value,
        'role_id', invite_record.role_id,
        'applied_at', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para aplicar convites na criação de usuários
DROP TRIGGER IF EXISTS trigger_apply_invite_on_user_creation ON auth.users;
CREATE TRIGGER trigger_apply_invite_on_user_creation
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_invite_on_user_creation();

-- Função para atualizar role do usuário quando perfil é criado
CREATE OR REPLACE FUNCTION public.apply_invite_role_on_profile_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_metadata JSONB;
  invite_token_value TEXT;
  invite_record public.invites;
BEGIN
  -- Buscar metadados do usuário
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users
  WHERE id = NEW.id;
  
  -- Verificar se há um invite_token nos metadados
  invite_token_value := user_metadata->>'invite_token';
  
  -- Se não há token, usar role padrão
  IF invite_token_value IS NULL OR invite_token_value = '' THEN
    -- Aplicar role padrão 'club' se não há role_id definido
    IF NEW.role_id IS NULL THEN
      UPDATE public.profiles
      SET role_id = (SELECT id FROM public.user_roles WHERE name = 'club' LIMIT 1)
      WHERE id = NEW.id;
    END IF;
    RETURN NEW;
  END IF;
  
  -- Limpar o token
  invite_token_value := upper(regexp_replace(invite_token_value, '\s+', '', 'g'));
  
  -- Buscar convite usado por este usuário
  SELECT * INTO invite_record
  FROM public.invites
  WHERE upper(token) = invite_token_value
  AND used_at IS NOT NULL;
  
  -- Se não encontrou, tentar busca parcial
  IF invite_record.id IS NULL AND length(invite_token_value) >= 8 THEN
    SELECT * INTO invite_record
    FROM public.invites
    WHERE upper(token) ILIKE (substring(invite_token_value from 1 for 8) || '%')
    AND used_at IS NOT NULL
    LIMIT 1;
  END IF;
  
  -- Se encontrou convite, aplicar role
  IF invite_record.id IS NOT NULL THEN
    UPDATE public.profiles
    SET role_id = invite_record.role_id
    WHERE id = NEW.id;
  ELSE
    -- Aplicar role padrão se convite não encontrado
    IF NEW.role_id IS NULL THEN
      UPDATE public.profiles
      SET role_id = (SELECT id FROM public.user_roles WHERE name = 'club' LIMIT 1)
      WHERE id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para aplicar role quando perfil é criado
DROP TRIGGER IF EXISTS trigger_apply_invite_role_on_profile_creation ON public.profiles;
CREATE TRIGGER trigger_apply_invite_role_on_profile_creation
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_invite_role_on_profile_creation();

-- Comentários de documentação
COMMENT ON FUNCTION public.apply_invite_on_user_creation() IS 'Aplica convite automaticamente quando usuário é criado via auth.users';
COMMENT ON FUNCTION public.apply_invite_role_on_profile_creation() IS 'Aplica role do convite quando perfil é criado';
