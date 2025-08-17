-- Corrigir estado do onboarding para usuários que completaram todas as etapas
UPDATE public.profiles 
SET onboarding_completed = true, updated_at = now()
WHERE id = 'd3f7f835-6623-4cc1-a033-79896d56b0e0';

UPDATE public.onboarding_final 
SET is_completed = true, completed_at = now(), updated_at = now()
WHERE user_id = 'd3f7f835-6623-4cc1-a033-79896d56b0e0';

-- Função para corrigir automaticamente usuários com onboarding incompleto mas que já fizeram todas as etapas
CREATE OR REPLACE FUNCTION public.fix_incomplete_onboarding_states()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  fixed_count integer := 0;
BEGIN
  -- Atualizar profiles para usuários que completaram todas as 5 etapas mas não foram marcados como completos
  UPDATE public.profiles 
  SET onboarding_completed = true, updated_at = now()
  WHERE id IN (
    SELECT user_id 
    FROM public.onboarding_final 
    WHERE array_length(completed_steps, 1) = 5 
    AND is_completed = false
  )
  AND onboarding_completed = false;
  
  GET DIAGNOSTICS fixed_count = ROW_COUNT;
  
  -- Atualizar onboarding_final
  UPDATE public.onboarding_final 
  SET is_completed = true, completed_at = now(), updated_at = now()
  WHERE array_length(completed_steps, 1) = 5 
  AND is_completed = false;
  
  RETURN jsonb_build_object(
    'success', true,
    'fixed_profiles', fixed_count,
    'message', 'Estados de onboarding corrigidos com sucesso'
  );
END;
$$;