-- Verificar se a função get_onboarding_next_step existe e criar se necessário
CREATE OR REPLACE FUNCTION public.get_onboarding_next_step(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile public.profiles;
  v_onboarding public.onboarding_final;
  v_step integer;
  v_redirect_url text;
  v_is_completed boolean;
BEGIN
  -- Buscar perfil do usuário
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  
  -- Se não existe perfil, retornar erro
  IF v_profile.id IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'user_not_found',
      'message', 'Usuário não encontrado',
      'redirect_url', '/login'
    );
  END IF;
  
  -- Se onboarding já está marcado como completo no perfil
  IF v_profile.onboarding_completed = true THEN
    RETURN jsonb_build_object(
      'is_completed', true,
      'current_step', 7,
      'redirect_url', '/dashboard',
      'message', 'Onboarding já completado'
    );
  END IF;
  
  -- Buscar dados de onboarding
  SELECT * INTO v_onboarding FROM public.onboarding_final WHERE user_id = p_user_id;
  
  -- Se não existe onboarding, inicializar automaticamente
  IF v_onboarding.id IS NULL THEN
    INSERT INTO public.onboarding_final (
      user_id,
      current_step,
      completed_steps,
      is_completed,
      personal_info,
      business_info,
      ai_experience,
      goals,
      preferences,
      status
    ) VALUES (
      p_user_id,
      1,
      ARRAY[]::integer[],
      false,
      '{}',
      '{}',
      '{}',
      '{}',
      '{}',
      'in_progress'
    ) RETURNING * INTO v_onboarding;
  END IF;
  
  -- Verificar se está completo
  v_is_completed := v_onboarding.is_completed;
  v_step := COALESCE(v_onboarding.current_step, 1);
  
  -- Se completado, redirecionar para dashboard
  IF v_is_completed THEN
    v_redirect_url := '/dashboard';
  ELSE
    -- Determinar próximo passo baseado no current_step
    CASE v_step
      WHEN 1 THEN v_redirect_url := '/onboarding/step/1';
      WHEN 2 THEN v_redirect_url := '/onboarding/step/2';
      WHEN 3 THEN v_redirect_url := '/onboarding/step/3';
      WHEN 4 THEN v_redirect_url := '/onboarding/step/4';
      WHEN 5 THEN v_redirect_url := '/onboarding/step/5';
      WHEN 6 THEN v_redirect_url := '/onboarding/step/6';
      ELSE v_redirect_url := '/dashboard';
    END CASE;
  END IF;
  
  RETURN jsonb_build_object(
    'current_step', v_step,
    'is_completed', v_is_completed,
    'redirect_url', v_redirect_url,
    'completed_steps', COALESCE(v_onboarding.completed_steps, ARRAY[]::integer[]),
    'status', COALESCE(v_onboarding.status, 'in_progress')
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro em get_onboarding_next_step: %', SQLERRM;
    RETURN jsonb_build_object(
      'error', 'internal_error',
      'message', 'Erro interno: ' || SQLERRM,
      'redirect_url', '/dashboard'
    );
END;
$$;