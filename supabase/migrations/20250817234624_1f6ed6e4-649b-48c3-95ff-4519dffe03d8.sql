-- Criar função para completar onboarding usando onboarding_final
CREATE OR REPLACE FUNCTION public.complete_onboarding_final_flow(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  onboarding_data record;
  result jsonb;
BEGIN
  -- Buscar dados do onboarding_final
  SELECT * INTO onboarding_data
  FROM public.onboarding_final 
  WHERE user_id = p_user_id;
  
  -- Se não encontrou dados do onboarding, criar registro básico
  IF onboarding_data IS NULL THEN
    RAISE NOTICE '[ONBOARDING] Dados não encontrados para usuário: %', p_user_id;
    
    -- Apenas marcar onboarding como completo no perfil
    UPDATE public.profiles 
    SET 
      onboarding_completed = true,
      updated_at = now()
    WHERE id = p_user_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Onboarding finalizado sem dados específicos'
    );
  END IF;
  
  RAISE NOTICE '[ONBOARDING] Finalizando onboarding para usuário: %', p_user_id;
  
  -- Atualizar perfil com dados do onboarding_final
  UPDATE public.profiles 
  SET 
    onboarding_completed = true,
    name = COALESCE(onboarding_data.personal_info->>'name', name),
    company_name = COALESCE(onboarding_data.professional_info->>'company_name', company_name),
    industry = COALESCE(onboarding_data.professional_info->>'company_sector', industry),
    company_size = COALESCE(onboarding_data.professional_info->>'company_size', company_size),
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Marcar onboarding_final como completo
  UPDATE public.onboarding_final
  SET 
    is_completed = true,
    completed_at = now(),
    current_step = 6,
    completed_steps = ARRAY[0,1,2,3,4,5],
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log da operação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    p_user_id,
    'onboarding_completion',
    'final_onboarding_completed',
    jsonb_build_object(
      'completed_at', now(),
      'transferred_to_profile', true
    ),
    'info'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Onboarding finalizado com sucesso',
    'completed_at', now()
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Erro ao finalizar onboarding: ' || SQLERRM
    );
END;
$$;