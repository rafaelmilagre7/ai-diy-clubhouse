-- 1. Corrigir usuário atual: marcar onboarding como completo
UPDATE public.onboarding 
SET is_completed = true, 
    completed_at = now()
WHERE user_id = 'dc418224-acd7-4f5f-9a7e-e1c981b78fb6' 
  AND is_completed = false;

-- 2. Sincronizar profile do usuário atual
UPDATE public.profiles 
SET onboarding_completed = true,
    onboarding_completed_at = now()
WHERE id = 'dc418224-acd7-4f5f-9a7e-e1c981b78fb6' 
  AND onboarding_completed = false;

-- 3. Criar trigger para sincronização automática futura
CREATE OR REPLACE FUNCTION sync_onboarding_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Se onboarding foi marcado como completo, atualizar profiles
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    UPDATE public.profiles 
    SET onboarding_completed = true,
        onboarding_completed_at = COALESCE(NEW.completed_at, now())
    WHERE id = NEW.user_id;
  END IF;
  
  -- Se onboarding foi desmarcado como completo, atualizar profiles
  IF NEW.is_completed = false AND OLD.is_completed = true THEN
    UPDATE public.profiles 
    SET onboarding_completed = false,
        onboarding_completed_at = NULL
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Aplicar trigger na tabela onboarding
DROP TRIGGER IF EXISTS onboarding_completion_sync ON public.onboarding;
CREATE TRIGGER onboarding_completion_sync
  AFTER UPDATE ON public.onboarding
  FOR EACH ROW
  EXECUTE FUNCTION sync_onboarding_completion();