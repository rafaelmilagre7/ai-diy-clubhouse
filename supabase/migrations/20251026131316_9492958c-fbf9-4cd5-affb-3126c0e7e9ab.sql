-- ============================================================================
-- CORREÇÃO CRÍTICA: handle_new_user copiar whatsapp_number do convite
-- ============================================================================
-- Descrição: Corrige a função handle_new_user para copiar whatsapp_number
--            do convite para o perfil durante o cadastro
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invite_record public.invites;
  invite_token text;
  default_role_id uuid;
  extracted_name text;
BEGIN
  RAISE LOG '[HANDLE_NEW_USER] Iniciando para usuário: %', NEW.email;
  
  -- Extrair token de convite dos metadados
  invite_token := NEW.raw_user_meta_data->>'invite_token';
  
  -- Se há token de convite, buscar o convite
  IF invite_token IS NOT NULL THEN
    RAISE LOG '[HANDLE_NEW_USER] Token encontrado: %', invite_token;
    
    SELECT * INTO invite_record
    FROM public.invites
    WHERE token = invite_token
    AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF invite_record.id IS NOT NULL THEN
      RAISE LOG '[HANDLE_NEW_USER] Convite encontrado: % (whatsapp: %)', 
        invite_record.id, 
        COALESCE(invite_record.whatsapp_number, 'NULL');
    ELSE
      RAISE LOG '[HANDLE_NEW_USER] Convite não encontrado ou expirado';
    END IF;
  ELSE
    RAISE LOG '[HANDLE_NEW_USER] Sem token de convite nos metadados';
  END IF;
  
  -- Determinar role_id
  IF invite_record.id IS NOT NULL THEN
    default_role_id := invite_record.role_id;
    
    -- Marcar convite como usado
    UPDATE public.invites
    SET used_at = now()
    WHERE id = invite_record.id;
    
    RAISE LOG '[HANDLE_NEW_USER] Convite marcado como usado';
  ELSE
    -- Buscar role padrão (member/membro)
    SELECT id INTO default_role_id
    FROM public.user_roles
    WHERE name IN ('member', 'membro', 'membro_club')
    ORDER BY name
    LIMIT 1;
    
    RAISE LOG '[HANDLE_NEW_USER] Usando role padrão: %', default_role_id;
  END IF;
  
  -- Extrair nome dos metadados
  extracted_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );
  
  RAISE LOG '[HANDLE_NEW_USER] Nome extraído: %', extracted_name;
  
  -- ✅ CORREÇÃO: Criar perfil COM whatsapp_number do convite
  INSERT INTO public.profiles (
    id,
    email,
    role_id,
    name,
    whatsapp_number,
    created_at,
    updated_at,
    onboarding_completed,
    status
  ) VALUES (
    NEW.id,
    NEW.email,
    default_role_id,
    extracted_name,
    invite_record.whatsapp_number,
    now(),
    now(),
    false,
    'active'
  );
  
  RAISE LOG '[HANDLE_NEW_USER] Perfil criado com whatsapp: %', 
    COALESCE(invite_record.whatsapp_number, 'NULL');
  
  -- ✅ Inicializar onboarding com dados completos
  INSERT INTO public.onboarding_final (
    user_id,
    current_step,
    completed_steps,
    is_completed,
    personal_info,
    business_info,
    ai_experience,
    goals_info,
    personalization,
    status,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    1,
    ARRAY[]::integer[],
    false,
    jsonb_build_object(
      'name', extracted_name,
      'email', NEW.email
    ) || CASE 
      WHEN invite_record.whatsapp_number IS NOT NULL 
      THEN jsonb_build_object(
        'phone', invite_record.whatsapp_number, 
        'from_invite', true,
        'phone_verified', false
      )
      ELSE '{}'::jsonb
    END,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    'in_progress',
    now(),
    now()
  );
  
  RAISE LOG '[HANDLE_NEW_USER] Onboarding inicializado com sucesso';
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '[HANDLE_NEW_USER] ❌ ERRO para %: % (SQLSTATE: %)', 
      NEW.email, 
      SQLERRM,
      SQLSTATE;
    
    BEGIN
      INSERT INTO public.audit_logs (
        user_id,
        event_type,
        action,
        details,
        severity
      ) VALUES (
        NEW.id,
        'user_registration_error',
        'handle_new_user_failed',
        jsonb_build_object(
          'email', NEW.email,
          'error', SQLERRM,
          'sqlstate', SQLSTATE,
          'invite_token', invite_token,
          'timestamp', now()
        ),
        'error'
      );
    EXCEPTION
      WHEN OTHERS THEN
        NULL;
    END;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user IS 'Cria perfil e onboarding automaticamente após registro. Copia whatsapp_number do convite para o perfil.';

-- Função de recuperação para perfis existentes
CREATE OR REPLACE FUNCTION public.recover_missing_whatsapp_numbers()
RETURNS TABLE(
  user_id uuid,
  email text,
  whatsapp_recovered text,
  updated boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recovery_count integer := 0;
BEGIN
  RETURN QUERY
  WITH updated_profiles AS (
    UPDATE public.profiles p
    SET 
      whatsapp_number = i.whatsapp_number,
      updated_at = now()
    FROM public.invites i
    WHERE 
      p.email = i.email
      AND i.whatsapp_number IS NOT NULL
      AND i.whatsapp_number != ''
      AND (p.whatsapp_number IS NULL OR p.whatsapp_number = '')
      AND i.used_at IS NOT NULL
    RETURNING p.id, p.email, i.whatsapp_number
  )
  SELECT 
    up.id,
    up.email,
    up.whatsapp_number,
    true
  FROM updated_profiles up;
END;
$$;

COMMENT ON FUNCTION public.recover_missing_whatsapp_numbers IS 'Recupera whatsapp_number de perfis existentes usando dados dos convites';

-- Executar recuperação
SELECT * FROM public.recover_missing_whatsapp_numbers();