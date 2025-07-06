-- Criar função para inicializar entrada na tabela onboarding_final após aplicar convite
CREATE OR REPLACE FUNCTION public.initialize_onboarding_after_invite()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se a mudança foi de NULL para um role_id (aplicação de convite)
  IF OLD.role_id IS NULL AND NEW.role_id IS NOT NULL THEN
    -- Inserir entrada inicial na tabela onboarding_final
    INSERT INTO public.onboarding_final (
      user_id,
      personal_info,
      location_info,
      discovery_info,
      business_info,
      business_context,
      goals_info,
      ai_experience,
      personalization,
      current_step,
      completed_steps,
      is_completed
    ) VALUES (
      NEW.id,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      1,
      '{}',
      false
    )
    ON CONFLICT (user_id) DO NOTHING; -- Evitar duplicatas se já existir
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para executar após atualização de role_id
DROP TRIGGER IF EXISTS trigger_initialize_onboarding_after_invite ON public.profiles;
CREATE TRIGGER trigger_initialize_onboarding_after_invite
  AFTER UPDATE OF role_id ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_onboarding_after_invite();

-- Função para marcar onboarding como completo e atualizar profile
CREATE OR REPLACE FUNCTION public.complete_onboarding(p_user_id uuid)
RETURNS json AS $$
DECLARE
  onboarding_record public.onboarding_final;
BEGIN
  -- Buscar registro de onboarding
  SELECT * INTO onboarding_record
  FROM public.onboarding_final
  WHERE user_id = p_user_id;
  
  IF onboarding_record.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Registro de onboarding não encontrado'
    );
  END IF;
  
  -- Marcar onboarding como completo
  UPDATE public.onboarding_final
  SET 
    is_completed = true,
    completed_at = now(),
    current_step = 7, -- Último step
    completed_steps = ARRAY[1,2,3,4,5,6] -- Todos os steps
  WHERE user_id = p_user_id;
  
  -- Atualizar profile para marcar onboarding_completed
  UPDATE public.profiles
  SET 
    onboarding_completed = true,
    onboarding_completed_at = now()
  WHERE id = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Onboarding completado com sucesso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;