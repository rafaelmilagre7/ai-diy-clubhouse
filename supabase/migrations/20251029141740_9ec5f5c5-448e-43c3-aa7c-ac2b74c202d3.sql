-- Corrigir função RPC complete_onboarding_final_flow
-- Problema: estava usando professional_info ao invés de business_info

CREATE OR REPLACE FUNCTION public.complete_onboarding_final_flow(
  p_user_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  onboarding_data record;
  result jsonb;
BEGIN
  RAISE NOTICE '[ONBOARDING_RPC] Iniciando finalização para usuário: %', p_user_id;
  
  -- Buscar dados do onboarding_final
  SELECT * INTO onboarding_data
  FROM public.onboarding_final 
  WHERE user_id = p_user_id;
  
  -- Se não encontrou dados do onboarding, criar registro básico
  IF onboarding_data IS NULL THEN
    RAISE NOTICE '[ONBOARDING_RPC] Dados não encontrados - criando registro básico';
    
    -- Criar registro básico e marcar como completo
    INSERT INTO public.onboarding_final (
      user_id,
      current_step,
      completed_steps,
      is_completed,
      completed_at,
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      6,
      ARRAY[1,2,3,4,5,6],
      true,
      now(),
      now(),
      now()
    );
    
    -- Marcar perfil como completo
    UPDATE public.profiles 
    SET 
      onboarding_completed = true,
      updated_at = now()
    WHERE id = p_user_id;
    
    RAISE NOTICE '[ONBOARDING_RPC] Onboarding básico criado e finalizado';
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Onboarding finalizado (criado do zero)'
    );
  END IF;
  
  RAISE NOTICE '[ONBOARDING_RPC] Dados encontrados - finalizando onboarding existente';
  RAISE NOTICE '[ONBOARDING_RPC] Estado atual: current_step=%, completed_steps=%, is_completed=%', 
    onboarding_data.current_step, onboarding_data.completed_steps, onboarding_data.is_completed;
  
  -- CORREÇÃO CRÍTICA: Atualizar onboarding_final com step 6 incluído
  UPDATE public.onboarding_final
  SET 
    is_completed = true,
    completed_at = now(),
    current_step = 6,
    completed_steps = CASE 
      WHEN 6 = ANY(completed_steps) THEN completed_steps
      ELSE array_append(completed_steps, 6)
    END,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RAISE NOTICE '[ONBOARDING_RPC] onboarding_final atualizado';
  
  -- Atualizar profiles com dados corretos (business_info ao invés de professional_info)
  UPDATE public.profiles 
  SET 
    onboarding_completed = true,
    name = COALESCE(onboarding_data.personal_info->>'name', name),
    company_name = COALESCE(onboarding_data.business_info->>'company_name', company_name),
    industry = COALESCE(onboarding_data.business_info->>'business_sector', industry),
    updated_at = now()
  WHERE id = p_user_id;
  
  RAISE NOTICE '[ONBOARDING_RPC] profiles atualizado';
  
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
      'transferred_to_profile', true,
      'current_step_final', 6,
      'completed_steps_final', CASE 
        WHEN 6 = ANY(onboarding_data.completed_steps) THEN onboarding_data.completed_steps
        ELSE array_append(onboarding_data.completed_steps, 6)
      END
    ),
    'info'
  );
  
  RAISE NOTICE '[ONBOARDING_RPC] Finalização concluída com sucesso';
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Onboarding finalizado com sucesso',
    'completed_at', now()
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '[ONBOARDING_RPC] ERRO: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;