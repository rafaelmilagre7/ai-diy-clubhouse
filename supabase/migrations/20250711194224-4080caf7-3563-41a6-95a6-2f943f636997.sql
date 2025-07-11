-- 🔥 CORREÇÃO CRÍTICA: Criar trigger para perfis automáticos

-- 1. Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Inserir perfil automaticamente
  INSERT INTO public.profiles (
    id,
    email,
    name
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  
  -- Log da criação para auditoria
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details
  ) VALUES (
    NEW.id,
    'account_creation',
    'auto_profile_creation',
    jsonb_build_object(
      'email', NEW.email,
      'created_at', NEW.created_at,
      'metadata', NEW.raw_user_meta_data
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se perfil já existe, apenas retornar NEW sem erro
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log do erro mas não falhar o processo de registro
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details
    ) VALUES (
      NEW.id,
      'account_creation',
      'profile_creation_error',
      jsonb_build_object(
        'error', SQLERRM,
        'email', NEW.email
      )
    );
    RETURN NEW;
END;
$$;

-- 2. Criar trigger que executa após inserção de usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Função para processar convites automaticamente após criação do perfil
CREATE OR REPLACE FUNCTION public.process_invite_after_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_token TEXT;
  invite_record RECORD;
BEGIN
  -- Verificar se há token de convite nos metadados
  invite_token := NEW.raw_user_meta_data->>'invite_token';
  
  IF invite_token IS NOT NULL THEN
    -- Aguardar um pouco para garantir que o perfil foi criado
    PERFORM pg_sleep(0.1);
    
    -- Buscar convite válido
    SELECT * INTO invite_record
    FROM public.invites
    WHERE UPPER(token) = UPPER(invite_token)
    AND used_at IS NULL
    AND expires_at > NOW()
    LIMIT 1;
    
    IF invite_record.id IS NOT NULL THEN
      -- Aplicar role do convite ao perfil
      UPDATE public.profiles
      SET role_id = invite_record.role_id
      WHERE id = NEW.id;
      
      -- Marcar convite como usado
      UPDATE public.invites
      SET used_at = NOW()
      WHERE id = invite_record.id;
      
      -- Log da aplicação do convite
      INSERT INTO public.audit_logs (
        user_id,
        event_type,
        action,
        details
      ) VALUES (
        NEW.id,
        'invite_processed',
        'auto_invite_application',
        jsonb_build_object(
          'invite_id', invite_record.id,
          'token', invite_token,
          'role_id', invite_record.role_id
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Trigger para processar convites automaticamente
DROP TRIGGER IF EXISTS process_signup_invite ON auth.users;
CREATE TRIGGER process_signup_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.process_invite_after_signup();