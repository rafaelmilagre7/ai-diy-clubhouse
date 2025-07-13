-- Corrigir erro da função complete_onboarding
DROP FUNCTION IF EXISTS public.complete_onboarding(uuid);

-- Recriar função complete_onboarding com tipo de retorno correto
CREATE OR REPLACE FUNCTION public.complete_onboarding(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  onboarding_record public.onboarding_final;
BEGIN
  -- Buscar registro de onboarding
  SELECT * INTO onboarding_record
  FROM public.onboarding_final
  WHERE user_id = p_user_id;
  
  -- Se não existe registro, retornar erro
  IF onboarding_record.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Registro de onboarding não encontrado'
    );
  END IF;
  
  -- Se já está completo, retornar sucesso
  IF onboarding_record.is_completed = true THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Onboarding já estava completo',
      'already_completed', true
    );
  END IF;
  
  -- Marcar como completo
  UPDATE public.onboarding_final
  SET 
    is_completed = true,
    completed_at = now(),
    current_step = 7,
    completed_steps = ARRAY[1,2,3,4,5,6],
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Atualizar perfil
  UPDATE public.profiles
  SET 
    onboarding_completed = true,
    onboarding_completed_at = now(),
    name = COALESCE(onboarding_record.personal_info->>'name', name),
    company_name = COALESCE(onboarding_record.business_info->>'company_name', company_name),
    industry = COALESCE(onboarding_record.business_info->>'company_sector', industry)
  WHERE id = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Onboarding completado com sucesso'
  );
END;
$$;