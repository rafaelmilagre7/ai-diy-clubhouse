-- Corrigir a função update_onboarding_step para mapear corretamente o step 3
CREATE OR REPLACE FUNCTION public.update_onboarding_step(p_user_id uuid, p_step integer, p_data jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  onboarding_record public.onboarding_final;
  updated_steps integer[];
BEGIN
  -- Verificar permissão
  IF p_user_id != auth.uid() AND NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Buscar onboarding
  SELECT * INTO onboarding_record FROM public.onboarding_final WHERE user_id = p_user_id;
  
  IF onboarding_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Onboarding não encontrado');
  END IF;
  
  -- Adicionar step aos completados se não estiver
  updated_steps := onboarding_record.completed_steps;
  IF NOT (p_step = ANY(updated_steps)) THEN
    updated_steps := array_append(updated_steps, p_step);
  END IF;
  
  -- Atualizar onboarding com mapeamento correto dos steps
  UPDATE public.onboarding_final
  SET 
    current_step = GREATEST(p_step + 1, current_step),
    completed_steps = updated_steps,
    personal_info = CASE 
      WHEN p_step = 1 THEN public.merge_json_data(personal_info, p_data)
      ELSE personal_info
    END,
    professional_info = CASE 
      WHEN p_step = 2 THEN public.merge_json_data(professional_info, p_data)
      ELSE professional_info
    END,
    ai_experience = CASE 
      WHEN p_step = 3 THEN public.merge_json_data(ai_experience, p_data)
      ELSE ai_experience
    END,
    goals_info = CASE 
      WHEN p_step = 4 THEN public.merge_json_data(goals_info, p_data)
      ELSE goals_info
    END,
    personalization = CASE 
      WHEN p_step = 5 THEN public.merge_json_data(personalization, p_data)
      ELSE personalization
    END,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'current_step', GREATEST(p_step + 1, onboarding_record.current_step),
    'completed_steps', updated_steps
  );
END;
$function$;