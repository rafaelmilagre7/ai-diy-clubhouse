-- Corrigir função criada para ter search_path seguro
CREATE OR REPLACE FUNCTION sync_onboarding_completion()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Se onboarding foi marcado como completo, garantir consistência
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    -- Atualizar current_step para 6 e incluir todos os steps
    NEW.current_step = 6;
    NEW.completed_steps = ARRAY[1,2,3,4,5,6];
    
    -- Atualizar tabela profiles para manter sincronia
    UPDATE public.profiles 
    SET 
      onboarding_completed = true,
      onboarding_completed_at = COALESCE(NEW.completed_at, NOW()),
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;