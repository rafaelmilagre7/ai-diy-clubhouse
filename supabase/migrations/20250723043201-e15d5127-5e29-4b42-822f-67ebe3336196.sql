-- Corrigir/criar função complete_onboarding_flow
CREATE OR REPLACE FUNCTION public.complete_onboarding_flow(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  onboarding_record record;
  result jsonb;
BEGIN
  -- Log da operação
  RAISE NOTICE '[ONBOARDING] Finalizando onboarding para usuário: %', p_user_id;
  
  -- Verificar se usuário existe
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Usuário não encontrado'
    );
  END IF;
  
  -- Buscar dados do onboarding
  SELECT * INTO onboarding_record
  FROM public.onboarding_final 
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Dados de onboarding não encontrados'
    );
  END IF;
  
  -- Marcar onboarding como completado na tabela onboarding_final
  UPDATE public.onboarding_final
  SET 
    is_completed = true,
    completed_at = now(),
    current_step = 6,
    completed_steps = ARRAY[1, 2, 3, 4, 5, 6],
    status = 'completed'
  WHERE user_id = p_user_id;
  
  -- CRÍTICO: Atualizar perfil do usuário
  UPDATE public.profiles
  SET 
    onboarding_completed = true,
    onboarding_completed_at = now(),
    -- Sincronizar dados básicos do onboarding
    name = COALESCE(
      (onboarding_record.personal_info->>'name'), 
      name
    ),
    company_name = COALESCE(
      (onboarding_record.business_info->>'company_name'), 
      company_name
    ),
    industry = COALESCE(
      (onboarding_record.business_info->>'company_sector'), 
      industry
    ),
    current_position = COALESCE(
      (onboarding_record.business_info->>'current_position'), 
      current_position
    ),
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Log de auditoria
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    p_user_id,
    'onboarding_completed',
    'complete_onboarding_flow',
    jsonb_build_object(
      'completed_at', now(),
      'has_business_info', (onboarding_record.business_info IS NOT NULL),
      'has_personal_info', (onboarding_record.personal_info IS NOT NULL),
      'final_step', 6
    ),
    'info'
  );
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Onboarding finalizado com sucesso',
    'user_id', p_user_id,
    'completed_at', now()
  );
  
  RAISE NOTICE '[ONBOARDING] ✅ Onboarding finalizado: %', result;
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '[ONBOARDING] ❌ Erro: %', SQLERRM;
    
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'user_id', p_user_id
    );
END;
$function$;