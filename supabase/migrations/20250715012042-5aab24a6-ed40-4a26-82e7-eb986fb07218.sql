-- FASE 4A: Correções Menores Urgentes
-- 1. Adicionar campo status na tabela onboarding_final
ALTER TABLE public.onboarding_final 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress';

-- Atualizar registros existentes baseado no is_completed
UPDATE public.onboarding_final 
SET status = CASE 
  WHEN is_completed = true THEN 'completed'
  WHEN current_step >= 6 THEN 'final_step'
  WHEN current_step >= 1 THEN 'in_progress'
  ELSE 'not_started'
END
WHERE status IS NULL OR status = 'in_progress';

-- 2. Criar função validate_onboarding_state para diagnósticos
CREATE OR REPLACE FUNCTION public.validate_onboarding_state(p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
  onboarding_record public.onboarding_final;
  profile_record public.profiles;
  validation_result JSONB;
  issues JSONB := '[]'::JSONB;
  step_data JSONB;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  -- Buscar dados de onboarding e perfil
  SELECT * INTO onboarding_record FROM public.onboarding_final WHERE user_id = target_user_id;
  SELECT * INTO profile_record FROM public.profiles WHERE id = target_user_id;
  
  -- Verificar inconsistências
  
  -- 1. Onboarding existe mas perfil não
  IF onboarding_record.id IS NOT NULL AND profile_record.id IS NULL THEN
    issues := issues || jsonb_build_object(
      'type', 'missing_profile',
      'severity', 'critical',
      'message', 'Onboarding exists but profile missing'
    );
  END IF;
  
  -- 2. Perfil marca como completo mas onboarding não
  IF profile_record.onboarding_completed = true AND (onboarding_record.is_completed IS NULL OR onboarding_record.is_completed = false) THEN
    issues := issues || jsonb_build_object(
      'type', 'profile_onboarding_mismatch',
      'severity', 'high',
      'message', 'Profile shows completed but onboarding_final shows incomplete'
    );
  END IF;
  
  -- 3. Current_step não bate com completed_steps
  IF onboarding_record.id IS NOT NULL THEN
    IF onboarding_record.current_step > (SELECT COALESCE(array_length(onboarding_record.completed_steps, 1), 0)) + 1 THEN
      issues := issues || jsonb_build_object(
        'type', 'step_sequence_error',
        'severity', 'medium',
        'message', 'Current step is ahead of completed steps'
      );
    END IF;
  END IF;
  
  -- 4. Dados obrigatórios faltando por step
  IF onboarding_record.current_step >= 1 AND (onboarding_record.personal_info IS NULL OR onboarding_record.personal_info->>'name' IS NULL) THEN
    issues := issues || jsonb_build_object(
      'type', 'missing_required_data',
      'severity', 'medium', 
      'message', 'Step 1 data incomplete: missing name'
    );
  END IF;
  
  -- 5. Status inconsistente
  IF onboarding_record.id IS NOT NULL THEN
    IF onboarding_record.is_completed = true AND onboarding_record.status != 'completed' THEN
      issues := issues || jsonb_build_object(
        'type', 'status_mismatch',
        'severity', 'low',
        'message', 'is_completed=true but status != completed'
      );
    END IF;
  END IF;
  
  -- Montar resultado
  validation_result := jsonb_build_object(
    'user_id', target_user_id,
    'validation_timestamp', now(),
    'has_issues', jsonb_array_length(issues) > 0,
    'issues_count', jsonb_array_length(issues),
    'issues', issues,
    'onboarding_data', CASE 
      WHEN onboarding_record.id IS NOT NULL THEN 
        jsonb_build_object(
          'exists', true,
          'current_step', onboarding_record.current_step,
          'completed_steps', onboarding_record.completed_steps,
          'is_completed', onboarding_record.is_completed,
          'status', onboarding_record.status,
          'created_at', onboarding_record.created_at,
          'updated_at', onboarding_record.updated_at
        )
      ELSE jsonb_build_object('exists', false)
    END,
    'profile_data', CASE 
      WHEN profile_record.id IS NOT NULL THEN 
        jsonb_build_object(
          'exists', true,
          'onboarding_completed', profile_record.onboarding_completed,
          'onboarding_completed_at', profile_record.onboarding_completed_at,
          'name', profile_record.name,
          'email', profile_record.email
        )
      ELSE jsonb_build_object('exists', false)
    END
  );
  
  RETURN validation_result;
END;
$$;

-- 3. Atualizar trigger sync_onboarding_final_to_profile para incluir status
CREATE OR REPLACE FUNCTION public.sync_onboarding_final_to_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log para debug
  RAISE NOTICE 'Sincronizando onboarding_final para profile do usuário: %', NEW.user_id;
  
  -- Atualizar perfil com dados mais detalhados
  UPDATE public.profiles
  SET 
    name = COALESCE(NEW.personal_info->>'name', name),
    company_name = COALESCE(
      NEW.business_info->>'company_name', 
      NEW.business_info->>'companyName',
      NEW.company_name,
      company_name
    ),
    industry = COALESCE(
      NEW.business_info->>'company_sector', 
      NEW.business_info->>'business_sector',
      industry
    ),
    onboarding_completed = NEW.is_completed,
    onboarding_completed_at = CASE 
      WHEN NEW.is_completed THEN COALESCE(NEW.completed_at, now()) 
      ELSE NULL 
    END,
    updated_at = now()
  WHERE id = NEW.user_id;
  
  -- Atualizar status baseado no progresso
  IF NEW.status IS NULL OR NEW.status = 'in_progress' THEN
    NEW.status := CASE 
      WHEN NEW.is_completed = true THEN 'completed'
      WHEN NEW.current_step >= 6 THEN 'final_step'
      WHEN NEW.current_step >= 1 THEN 'in_progress'
      ELSE 'not_started'
    END;
  END IF;
  
  -- Log resultado
  IF FOUND THEN
    RAISE NOTICE 'Profile atualizado com sucesso para usuário: %', NEW.user_id;
  ELSE
    RAISE WARNING 'Profile não encontrado para usuário: %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Atualizar função get_onboarding_next_step para incluir validação de estado
CREATE OR REPLACE FUNCTION public.get_onboarding_next_step(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  onboarding_record public.onboarding_final;
  profile_record public.profiles;
  validation_result JSONB;
  redirect_url TEXT;
BEGIN
  -- Validar estado primeiro
  SELECT public.validate_onboarding_state(p_user_id) INTO validation_result;
  
  -- Se há problemas críticos, tentar corrigir
  IF (validation_result->>'has_issues')::boolean = true THEN
    RAISE NOTICE 'Problemas detectados no onboarding do usuário %: %', p_user_id, validation_result->'issues';
  END IF;
  
  -- Buscar dados atualizados
  SELECT * INTO onboarding_record FROM public.onboarding_final WHERE user_id = p_user_id;
  SELECT * INTO profile_record FROM public.profiles WHERE id = p_user_id;
  
  -- Se não existe onboarding, inicializar
  IF onboarding_record.id IS NULL THEN
    RAISE NOTICE 'Inicializando onboarding para usuário %', p_user_id;
    
    INSERT INTO public.onboarding_final (
      user_id, current_step, completed_steps, is_completed, status,
      personal_info, business_info, ai_experience, goals, preferences
    ) VALUES (
      p_user_id, 1, ARRAY[]::integer[], false, 'not_started',
      '{}', '{}', '{}', '{}', '{}'
    );
    
    redirect_url := '/onboarding/step/1';
  -- Se onboarding completo
  ELSIF onboarding_record.is_completed = true THEN
    redirect_url := '/dashboard';
  -- Se em progresso
  ELSE
    redirect_url := '/onboarding/step/' || onboarding_record.current_step;
  END IF;
  
  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'redirect_url', redirect_url,
    'current_step', COALESCE(onboarding_record.current_step, 1),
    'completed_steps', COALESCE(onboarding_record.completed_steps, ARRAY[]::integer[]),
    'is_completed', COALESCE(onboarding_record.is_completed, false),
    'status', COALESCE(onboarding_record.status, 'not_started'),
    'validation_result', validation_result,
    'timestamp', now()
  );
END;
$$;