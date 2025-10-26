
-- Migration: Correção completa da função handle_new_user
-- Descrição: Inicializa todos os campos JSONB obrigatórios e adiciona logging adequado
-- Data: 2025-10-26

-- 1. Recriar função handle_new_user com todas as correções
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
  v_error_message text;
  v_error_detail text;
BEGIN
  -- Extrair token de convite dos metadados
  invite_token := NEW.raw_user_meta_data->>'invite_token';
  
  -- Se há token de convite, buscar o convite (sem usar coluna 'status' que não existe)
  IF invite_token IS NOT NULL THEN
    SELECT * INTO invite_record
    FROM public.invites
    WHERE token = invite_token
      AND expires_at > now()
      AND used_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  -- Determinar role_id
  IF invite_record.id IS NOT NULL THEN
    -- Usar role do convite
    default_role_id := invite_record.role_id;
    
    -- Marcar convite como usado (sem atualizar 'status' que não existe)
    UPDATE public.invites
    SET used_at = now()
    WHERE id = invite_record.id;
  ELSE
    -- Buscar role padrão (member/membro)
    SELECT id INTO default_role_id
    FROM public.user_roles
    WHERE name IN ('member', 'membro')
    ORDER BY name
    LIMIT 1;
  END IF;
  
  -- Extrair nome dos metadados
  extracted_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'display_name',
    invite_record.notes,
    split_part(NEW.email, '@', 1)
  );
  
  -- Criar perfil
  BEGIN
    INSERT INTO public.profiles (
      id,
      email,
      role_id,
      name,
      company_name,
      created_at,
      updated_at,
      onboarding_completed
    ) VALUES (
      NEW.id,
      NEW.email,
      default_role_id,
      extracted_name,
      invite_record.notes,
      now(),
      now(),
      false
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log detalhado do erro
      GET STACKED DIAGNOSTICS 
        v_error_message = MESSAGE_TEXT,
        v_error_detail = PG_EXCEPTION_DETAIL;
      
      RAISE LOG 'ERRO ao criar perfil para %: % (Detalhes: %)', 
        NEW.email, v_error_message, v_error_detail;
      
      -- Re-raise para não engolir erro crítico
      RAISE;
  END;
  
  -- Inicializar onboarding com TODOS os campos JSONB obrigatórios
  BEGIN
    INSERT INTO public.onboarding_final (
      user_id,
      current_step,
      completed_steps,
      is_completed,
      personal_info,
      location_info,
      discovery_info,
      business_info,
      business_context,
      goals_info,
      ai_experience,
      personalization,
      status,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      1,
      ARRAY[]::integer[],
      false,
      -- personal_info com dados do convite se disponível
      CASE 
        WHEN invite_record.id IS NOT NULL THEN
          jsonb_build_object(
            'name', extracted_name,
            'email', NEW.email,
            'phone', invite_record.whatsapp_number,
            'from_invite', true
          )
        ELSE
          jsonb_build_object(
            'name', extracted_name,
            'email', NEW.email
          )
      END,
      '{}'::jsonb, -- location_info
      '{}'::jsonb, -- discovery_info
      '{}'::jsonb, -- business_info
      '{}'::jsonb, -- business_context
      '{}'::jsonb, -- goals_info
      '{}'::jsonb, -- ai_experience
      '{}'::jsonb, -- personalization
      'in_progress',
      now(),
      now()
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log detalhado do erro
      GET STACKED DIAGNOSTICS 
        v_error_message = MESSAGE_TEXT,
        v_error_detail = PG_EXCEPTION_DETAIL;
      
      RAISE LOG 'ERRO ao criar onboarding para %: % (Detalhes: %)', 
        NEW.email, v_error_message, v_error_detail;
      
      -- Re-raise para não engolir erro crítico
      RAISE;
  END;
  
  -- Tentar criar log de auditoria (não crítico, pode falhar silenciosamente)
  BEGIN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_data,
      new_data,
      ip_address,
      user_agent
    ) VALUES (
      NEW.id,
      'INSERT',
      'profiles',
      NEW.id,
      NULL,
      jsonb_build_object(
        'email', NEW.email,
        'name', extracted_name,
        'role_id', default_role_id,
        'created_via', 'trigger'
      ),
      NEW.raw_user_meta_data->>'ip_address',
      NEW.raw_user_meta_data->>'user_agent'
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Apenas log, não falhar o cadastro por causa disso
      RAISE LOG 'Não foi possível criar audit_log para %: %', NEW.email, SQLERRM;
  END;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log final para qualquer erro não tratado
    RAISE LOG 'ERRO GERAL em handle_new_user para %: % (%)', 
      NEW.email, SQLERRM, SQLSTATE;
    
    -- Re-raise para que o erro seja visível
    RAISE;
END;
$$;

-- 2. Garantir que o trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Adicionar comentário
COMMENT ON FUNCTION public.handle_new_user IS 'Cria perfil e onboarding automaticamente no signup. Inicializa todos os campos JSONB obrigatórios e inclui logging detalhado para debug.';
