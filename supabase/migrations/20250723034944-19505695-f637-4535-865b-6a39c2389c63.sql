-- CORREÇÃO: Adicionar SET search_path para função de segurança
CREATE OR REPLACE FUNCTION public.complete_onboarding_flow(p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Atualizar onboarding como completo
  UPDATE public.onboarding_final
  SET 
    is_completed = true,
    completed_at = now(),
    status = 'completed',
    completed_steps = ARRAY[1,2,3,4,5,6]
  WHERE user_id = p_user_id;
  
  -- Atualizar profile
  UPDATE public.profiles
  SET 
    onboarding_completed = true,
    onboarding_completed_at = now()
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Onboarding completado com sucesso',
    'completed_at', now()
  );
END;
$$;