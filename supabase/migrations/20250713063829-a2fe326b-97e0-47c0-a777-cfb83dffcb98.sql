-- Verificar se RLS está habilitado na tabela onboarding_final
ALTER TABLE public.onboarding_final ENABLE ROW LEVEL SECURITY;

-- Limpar políticas duplicadas de INSERT se existirem
DROP POLICY IF EXISTS "onboarding_final_secure_insert" ON public.onboarding_final;
DROP POLICY IF EXISTS "Users can create their own onboarding" ON public.onboarding_final;
DROP POLICY IF EXISTS "Users can insert their own onboarding data" ON public.onboarding_final;

-- Criar política de INSERT clara e funcional
CREATE POLICY "Users can insert their own onboarding data" 
ON public.onboarding_final 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Garantir que os campos obrigatórios tenham valores padrão adequados
ALTER TABLE public.onboarding_final 
ALTER COLUMN personal_info SET DEFAULT '{}'::jsonb,
ALTER COLUMN location_info SET DEFAULT '{}'::jsonb,
ALTER COLUMN discovery_info SET DEFAULT '{}'::jsonb,
ALTER COLUMN business_info SET DEFAULT '{}'::jsonb,
ALTER COLUMN business_context SET DEFAULT '{}'::jsonb,
ALTER COLUMN goals_info SET DEFAULT '{}'::jsonb,
ALTER COLUMN ai_experience SET DEFAULT '{}'::jsonb,
ALTER COLUMN personalization SET DEFAULT '{}'::jsonb,
ALTER COLUMN is_completed SET DEFAULT false,
ALTER COLUMN current_step SET DEFAULT 1,
ALTER COLUMN completed_steps SET DEFAULT ARRAY[]::integer[];

-- Verificar se há problemas com colunas nullable
UPDATE public.onboarding_final 
SET 
    personal_info = COALESCE(personal_info, '{}'::jsonb),
    location_info = COALESCE(location_info, '{}'::jsonb),
    discovery_info = COALESCE(discovery_info, '{}'::jsonb),
    business_info = COALESCE(business_info, '{}'::jsonb),
    business_context = COALESCE(business_context, '{}'::jsonb),
    goals_info = COALESCE(goals_info, '{}'::jsonb),
    ai_experience = COALESCE(ai_experience, '{}'::jsonb),
    personalization = COALESCE(personalization, '{}'::jsonb),
    is_completed = COALESCE(is_completed, false),
    current_step = COALESCE(current_step, 1),
    completed_steps = COALESCE(completed_steps, ARRAY[]::integer[])
WHERE 
    personal_info IS NULL OR
    location_info IS NULL OR
    discovery_info IS NULL OR
    business_info IS NULL OR
    business_context IS NULL OR
    goals_info IS NULL OR
    ai_experience IS NULL OR
    personalization IS NULL OR
    is_completed IS NULL OR
    current_step IS NULL OR
    completed_steps IS NULL;