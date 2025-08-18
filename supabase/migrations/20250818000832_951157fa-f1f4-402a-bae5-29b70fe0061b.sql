-- Corrigir dados inconsistentes para usuários com onboarding completo
UPDATE onboarding_final 
SET 
  current_step = 6,
  completed_steps = ARRAY[1,2,3,4,5,6]
WHERE is_completed = true 
  AND current_step != 6;

-- Criar função para manter consistência automática
CREATE OR REPLACE FUNCTION sync_onboarding_completion()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para manter consistência
DROP TRIGGER IF EXISTS sync_onboarding_completion_trigger ON onboarding_final;
CREATE TRIGGER sync_onboarding_completion_trigger
  BEFORE UPDATE ON onboarding_final
  FOR EACH ROW 
  EXECUTE FUNCTION sync_onboarding_completion();