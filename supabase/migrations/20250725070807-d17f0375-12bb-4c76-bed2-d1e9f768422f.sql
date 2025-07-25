-- Continuar correção dos problemas de segurança restantes

-- 1. Corrigir todos os triggers sem search_path (os mais críticos primeiro)
CREATE OR REPLACE FUNCTION public.validate_onboarding_data_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Garantir que campos JSONB não sejam nulos
    NEW.personal_info = COALESCE(NEW.personal_info, '{}'::jsonb);
    NEW.professional_info = COALESCE(NEW.professional_info, '{}'::jsonb);
    NEW.business_goals = COALESCE(NEW.business_goals, '{}'::jsonb);
    NEW.ai_experience = COALESCE(NEW.ai_experience, '{}'::jsonb);
    NEW.experience_personalization = COALESCE(NEW.experience_personalization, '{}'::jsonb);
    NEW.complementary_info = COALESCE(NEW.complementary_info, '{}'::jsonb);
    NEW.business_context = COALESCE(NEW.business_context, '{}'::jsonb);
    
    -- Garantir que completed_steps seja array
    NEW.completed_steps = COALESCE(NEW.completed_steps, ARRAY[]::text[]);
    
    -- Sincronizar campos top-level com JSONB
    IF NEW.professional_info IS NOT NULL THEN
        NEW.company_name = COALESCE(NEW.professional_info->>'company_name', NEW.company_name);
        NEW.company_size = COALESCE(NEW.professional_info->>'company_size', NEW.company_size);
        NEW.company_sector = COALESCE(NEW.professional_info->>'company_sector', NEW.company_sector);
        NEW.company_website = COALESCE(NEW.professional_info->>'company_website', NEW.company_website);
        NEW.current_position = COALESCE(NEW.professional_info->>'current_position', NEW.current_position);
        NEW.annual_revenue = COALESCE(NEW.professional_info->>'annual_revenue', NEW.annual_revenue);
    END IF;
    
    NEW.updated_at = now();
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_invite_after_signup_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- 2. Corrigir mais triggers críticos
CREATE OR REPLACE FUNCTION public.audit_role_assignments_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log de mudanças de role
  IF (TG_OP = 'UPDATE' AND OLD.role_id IS DISTINCT FROM NEW.role_id) OR TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id, event_type, action, details
    ) VALUES (
      NEW.id,
      'role_assignment',
      TG_OP,
      jsonb_build_object(
        'old_role_id', OLD.role_id,
        'new_role_id', NEW.role_id,
        'changed_by', auth.uid(),
        'changed_at', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.detect_suspicious_activity_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_attempts INTEGER;
BEGIN
  -- Verificar múltiplas tentativas de mudança de papel
  SELECT COUNT(*) INTO recent_attempts
  FROM public.audit_logs
  WHERE user_id = auth.uid()
    AND event_type = 'role_change'
    AND timestamp > NOW() - INTERVAL '1 hour';
  
  IF recent_attempts > 3 THEN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      auth.uid(),
      'suspicious_activity',
      'multiple_role_change_attempts',
      jsonb_build_object(
        'attempts_count', recent_attempts,
        'time_window', '1 hour',
        'timestamp', NOW()
      ),
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$$;