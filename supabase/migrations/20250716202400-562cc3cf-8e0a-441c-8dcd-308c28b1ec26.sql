-- FASE 4: Correção de Funções sem Search Path - LOTE 2 (Funções de onboarding e autenticação)

-- 1. apply_invite_on_user_creation
CREATE OR REPLACE FUNCTION public.apply_invite_on_user_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  invite_token text;
  invite_record public.invites;
BEGIN
  -- Extrair token de convite dos metadados
  invite_token := NEW.raw_user_meta_data->>'invite_token';
  
  IF invite_token IS NOT NULL THEN
    -- Buscar convite válido
    SELECT * INTO invite_record
    FROM public.invites
    WHERE token = invite_token AND expires_at > now() AND used_at IS NULL;
    
    IF FOUND THEN
      -- Criar perfil com role do convite
      INSERT INTO public.profiles (
        id, email, role_id, status, created_at, updated_at
      ) VALUES (
        NEW.id, NEW.email, invite_record.role_id, 'active', now(), now()
      );
      
      -- Marcar convite como usado
      UPDATE public.invites
      SET used_at = now()
      WHERE id = invite_record.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. audit_profile_changes
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Log de mudanças em perfis
  INSERT INTO public.audit_logs (
    user_id, event_type, action, details
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    'profile_change',
    TG_OP,
    jsonb_build_object(
      'old_data', to_jsonb(OLD),
      'new_data', to_jsonb(NEW),
      'changed_at', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 3. check_and_fix_onboarding_data
CREATE OR REPLACE FUNCTION public.check_and_fix_onboarding_data(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  onboarding_exists boolean;
  profile_exists boolean;
BEGIN
  -- Verificar se onboarding existe
  SELECT EXISTS(
    SELECT 1 FROM public.onboarding_final WHERE user_id = p_user_id
  ) INTO onboarding_exists;
  
  -- Verificar se perfil existe
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = p_user_id
  ) INTO profile_exists;
  
  -- Se perfil existe mas onboarding não, criar
  IF profile_exists AND NOT onboarding_exists THEN
    INSERT INTO public.onboarding_final (
      user_id, current_step, completed_steps, is_completed,
      personal_info, business_info, ai_experience, goals_info, personalization,
      status, created_at, updated_at
    ) VALUES (
      p_user_id, 1, ARRAY[]::integer[], false,
      '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
      'not_started', now(), now()
    );
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Onboarding criado',
      'action', 'created'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Dados verificados',
    'onboarding_exists', onboarding_exists,
    'profile_exists', profile_exists
  );
END;
$$;

-- 4. check_onboarding_integrity
CREATE OR REPLACE FUNCTION public.check_onboarding_integrity(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  onboarding_record public.onboarding_final;
  profile_record public.profiles;
  integrity_issues text[] := '{}';
BEGIN
  -- Buscar dados
  SELECT * INTO onboarding_record FROM public.onboarding_final WHERE user_id = p_user_id;
  SELECT * INTO profile_record FROM public.profiles WHERE id = p_user_id;
  
  -- Verificar integridade
  IF onboarding_record.id IS NULL THEN
    integrity_issues := array_append(integrity_issues, 'missing_onboarding');
  END IF;
  
  IF profile_record.id IS NULL THEN
    integrity_issues := array_append(integrity_issues, 'missing_profile');
  END IF;
  
  IF onboarding_record.is_completed AND NOT profile_record.onboarding_completed THEN
    integrity_issues := array_append(integrity_issues, 'completion_mismatch');
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'has_issues', array_length(integrity_issues, 1) > 0,
    'issues', integrity_issues,
    'onboarding_status', onboarding_record.status,
    'profile_completed', profile_record.onboarding_completed
  );
END;
$$;

-- 5. check_rate_limit (corrigir a versão duplicada)
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_user_id uuid, p_action text, p_limit integer DEFAULT 10, p_window_minutes integer DEFAULT 60)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  attempt_count integer;
  window_start timestamp with time zone;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Contar tentativas na janela
  SELECT COUNT(*) INTO attempt_count
  FROM public.rate_limit_attempts
  WHERE user_id = p_user_id
  AND action = p_action
  AND attempted_at > window_start;
  
  -- Se excedeu o limite, retornar false
  IF attempt_count >= p_limit THEN
    RETURN false;
  END IF;
  
  -- Registrar tentativa
  INSERT INTO public.rate_limit_attempts (user_id, action, attempted_at)
  VALUES (p_user_id, p_action, now());
  
  RETURN true;
END;
$$;