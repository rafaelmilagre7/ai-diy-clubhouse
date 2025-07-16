-- FASE 4: Correção de Funções sem Search Path - LOTE 2B (COM DROP)

-- 1. apply_invite_role_on_profile_creation
CREATE OR REPLACE FUNCTION public.apply_invite_role_on_profile_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  invite_token text;
  invite_record public.invites;
BEGIN
  -- Extrair token de convite se existir
  SELECT i.* INTO invite_record
  FROM public.invites i
  WHERE i.email = NEW.email 
  AND i.expires_at > now() 
  AND i.used_at IS NULL
  ORDER BY i.created_at DESC
  LIMIT 1;
  
  IF FOUND THEN
    -- Atualizar role do perfil
    NEW.role_id := invite_record.role_id;
    
    -- Marcar convite como usado
    UPDATE public.invites
    SET used_at = now()
    WHERE id = invite_record.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. audit_role_assignments
CREATE OR REPLACE FUNCTION public.audit_role_assignments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Log de mudanças de role
  IF (TG_OP = 'UPDATE' AND OLD.role_id != NEW.role_id) OR TG_OP = 'INSERT' THEN
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

-- 3. audit_role_changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Log de mudanças nos roles
  INSERT INTO public.audit_logs (
    user_id, event_type, action, details
  ) VALUES (
    auth.uid(),
    'role_change',
    TG_OP,
    jsonb_build_object(
      'role_id', COALESCE(NEW.id, OLD.id),
      'old_data', to_jsonb(OLD),
      'new_data', to_jsonb(NEW),
      'changed_at', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 4. DROP e RECREATE check_and_fix_onboarding_data
DROP FUNCTION IF EXISTS public.check_and_fix_onboarding_data(uuid);
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