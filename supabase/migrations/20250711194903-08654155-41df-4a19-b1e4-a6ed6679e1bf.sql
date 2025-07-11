-- 🔥 CORREÇÃO CRÍTICA: Resolver conflitos de triggers e garantir execução

-- 1. Remover triggers conflitantes que podem estar interferindo
DROP TRIGGER IF EXISTS trigger_apply_invite_on_user_creation ON auth.users;
DROP TRIGGER IF EXISTS on_account_creation ON auth.users;

-- 2. Remover e recriar nossos triggers para garantir que funcionem
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS process_signup_invite ON auth.users;

-- 3. Recriar função handle_new_user com logs de debug melhorados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log de início para debug
  RAISE NOTICE 'TRIGGER EXECUTANDO: handle_new_user para usuário %', NEW.email;
  
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
  
  RAISE NOTICE 'PERFIL CRIADO para usuário %', NEW.email;
  
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
      'metadata', NEW.raw_user_meta_data,
      'trigger_execution', 'handle_new_user'
    )
  );
  
  RAISE NOTICE 'LOG DE AUDITORIA CRIADO para usuário %', NEW.email;
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se perfil já existe, apenas log e retornar
    RAISE NOTICE 'PERFIL JÁ EXISTE para usuário %', NEW.email;
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details
    ) VALUES (
      NEW.id,
      'account_creation',
      'profile_already_exists',
      jsonb_build_object(
        'email', NEW.email,
        'error', 'unique_violation'
      )
    );
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log do erro mas não falhar o processo de registro
    RAISE NOTICE 'ERRO AO CRIAR PERFIL para usuário %: %', NEW.email, SQLERRM;
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
        'email', NEW.email,
        'trigger_execution', 'handle_new_user'
      )
    );
    RETURN NEW;
END;
$$;

-- 4. Recriar função process_invite_after_signup com logs melhorados
CREATE OR REPLACE FUNCTION public.process_invite_after_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_token TEXT;
  invite_record RECORD;
BEGIN
  -- Log de início
  RAISE NOTICE 'TRIGGER EXECUTANDO: process_invite_after_signup para usuário %', NEW.email;
  
  -- Verificar se há token de convite nos metadados
  invite_token := NEW.raw_user_meta_data->>'invite_token';
  
  RAISE NOTICE 'TOKEN DE CONVITE encontrado: %', COALESCE(invite_token, 'NENHUM');
  
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
      RAISE NOTICE 'CONVITE VÁLIDO ENCONTRADO: % para role %', invite_record.id, invite_record.role_id;
      
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
          'role_id', invite_record.role_id,
          'trigger_execution', 'process_invite_after_signup'
        )
      );
      
      RAISE NOTICE 'CONVITE APLICADO COM SUCESSO para usuário %', NEW.email;
    ELSE
      RAISE NOTICE 'CONVITE INVÁLIDO OU EXPIRADO: %', invite_token;
      
      -- Log de convite inválido
      INSERT INTO public.audit_logs (
        user_id,
        event_type,
        action,
        details
      ) VALUES (
        NEW.id,
        'invite_processed',
        'invalid_invite_token',
        jsonb_build_object(
          'token', invite_token,
          'email', NEW.email
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERRO NO PROCESSAMENTO DE CONVITE para %: %', NEW.email, SQLERRM;
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details
    ) VALUES (
      NEW.id,
      'invite_processed',
      'invite_processing_error',
      jsonb_build_object(
        'error', SQLERRM,
        'token', invite_token,
        'email', NEW.email
      )
    );
    RETURN NEW;
END;
$$;

-- 5. Recriar triggers na ordem correta
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER process_signup_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.process_invite_after_signup();