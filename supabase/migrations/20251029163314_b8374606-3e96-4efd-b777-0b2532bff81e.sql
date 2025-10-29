-- Corrigir trigger para NÃO pré-preencher dados e começar no step 0
CREATE OR REPLACE FUNCTION public.auto_initialize_onboarding_on_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  onboarding_id uuid;
BEGIN
  -- Verificar se já existe onboarding
  IF EXISTS (SELECT 1 FROM public.onboarding_final WHERE user_id = NEW.id) THEN
    RAISE NOTICE '⏭️ Onboarding já existe para usuário %', NEW.id;
    RETURN NEW;
  END IF;
  
  -- ✅ Criar onboarding VAZIO (sem pré-preencher nada)
  INSERT INTO public.onboarding_final (
    user_id,
    personal_info,
    professional_info,
    ai_experience,
    goals_info,
    personalization,
    current_step,      -- ✅ Começar no step 0
    completed_steps,
    is_completed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    '{}'::jsonb,      -- ✅ Vazio (sem auto_initialized)
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    0,                -- ✅ Step 0 (escolha de tipo de usuário)
    ARRAY[]::integer[],
    false,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO onboarding_id;
  
  IF onboarding_id IS NOT NULL THEN
    RAISE NOTICE '✅ Onboarding inicializado no step 0 (vazio) para usuário %', NEW.id;
  ELSE
    RAISE NOTICE '⚠️ Conflito detectado - onboarding já existia para %', NEW.id;
  END IF;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '❌ Erro ao auto-inicializar onboarding para %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;