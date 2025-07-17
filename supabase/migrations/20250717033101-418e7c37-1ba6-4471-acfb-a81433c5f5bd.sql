-- Corrigir trigger sync_onboarding_final_to_profile
-- O trigger está tentando acessar campo company_name que não existe

CREATE OR REPLACE FUNCTION public.sync_onboarding_final_to_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log para debug
  RAISE NOTICE 'Sincronizando onboarding_final para profile do usuário: %', NEW.user_id;
  
  -- Atualizar perfil apenas com campos que existem
  UPDATE public.profiles
  SET 
    name = COALESCE(NEW.personal_info->>'name', name),
    company_name = COALESCE(
      NEW.business_info->>'company_name', 
      NEW.business_info->>'companyName',
      company_name
    ),
    industry = COALESCE(
      NEW.business_info->>'company_sector', 
      NEW.business_info->>'business_sector',
      industry
    ),
    onboarding_completed = NEW.is_completed,
    onboarding_completed_at = CASE 
      WHEN NEW.is_completed THEN COALESCE(NEW.completed_at, now()) 
      ELSE NULL 
    END,
    updated_at = now()
  WHERE id = NEW.user_id;
  
  -- Atualizar status baseado no progresso
  IF NEW.status IS NULL OR NEW.status = 'in_progress' THEN
    NEW.status := CASE 
      WHEN NEW.is_completed = true THEN 'completed'
      WHEN NEW.current_step >= 6 THEN 'final_step'
      WHEN NEW.current_step >= 1 THEN 'in_progress'
      ELSE 'not_started'
    END;
  END IF;
  
  -- Log resultado
  IF FOUND THEN
    RAISE NOTICE 'Profile atualizado com sucesso para usuário: %', NEW.user_id;
  ELSE
    RAISE WARNING 'Profile não encontrado para usuário: %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Agora corrigir onboarding do Diego Malta
UPDATE public.onboarding_final
SET 
  current_step = 1,
  completed_steps = ARRAY[]::integer[],
  ai_experience = '{}'::jsonb,
  status = 'in_progress',
  updated_at = now()
WHERE user_id = 'b837c23e-e064-4eb8-8648-f1298d4cbe75';

-- Atualizar perfil para garantir consistência
UPDATE public.profiles
SET 
  onboarding_completed = false,
  onboarding_completed_at = NULL,
  updated_at = now()
WHERE id = 'b837c23e-e064-4eb8-8648-f1298d4cbe75';

-- Log da correção
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  'b837c23e-e064-4eb8-8648-f1298d4cbe75',
  'onboarding_fix',
  'reset_stuck_onboarding',
  jsonb_build_object(
    'reason', 'User stuck on step 3',
    'previous_step', 3,
    'reset_to_step', 1,
    'fixed_by', 'admin_correction',
    'timestamp', now()
  )
);