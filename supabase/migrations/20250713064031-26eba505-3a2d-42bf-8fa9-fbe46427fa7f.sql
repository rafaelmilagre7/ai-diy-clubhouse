-- 1. Migrar dados de onboarding_sync para onboarding_final (se houver)
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
  is_completed,
  created_at,
  updated_at
)
SELECT 
  user_id,
  COALESCE(data->'personal_info', '{}'::jsonb),
  COALESCE(data->'location_info', '{}'::jsonb),
  COALESCE(data->'discovery_info', '{}'::jsonb),
  COALESCE(data->'business_info', '{}'::jsonb),
  COALESCE(data->'business_context', '{}'::jsonb),
  COALESCE(data->'goals_info', '{}'::jsonb),
  COALESCE(data->'ai_experience', '{}'::jsonb),
  COALESCE(data->'personalization', '{}'::jsonb),
  COALESCE((data->>'current_step')::integer, 1),
  COALESCE(
    CASE 
      WHEN jsonb_typeof(data->'completed_steps') = 'array' 
      THEN ARRAY(SELECT jsonb_array_elements_text(data->'completed_steps'))::integer[]
      ELSE ARRAY[]::integer[]
    END, 
    ARRAY[]::integer[]
  ),
  COALESCE((data->>'is_completed')::boolean, false),
  created_at,
  updated_at
FROM public.onboarding_sync
WHERE NOT EXISTS (
  SELECT 1 FROM public.onboarding_final 
  WHERE onboarding_final.user_id = onboarding_sync.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- 2. Atualizar função complete_onboarding para usar estrutura correta
CREATE OR REPLACE FUNCTION public.complete_onboarding(p_user_id uuid)
RETURNS jsonb
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
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Registro de onboarding não encontrado'
    );
  END IF;
  
  -- Se já está completo, retornar sucesso
  IF onboarding_record.is_completed = true THEN
    RETURN jsonb_build_object(
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
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Onboarding completado com sucesso'
  );
END;
$$;

-- 3. Criar trigger para sincronizar dados do onboarding_final com profiles
CREATE OR REPLACE FUNCTION public.sync_onboarding_final_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar perfil quando onboarding_final for modificado
  UPDATE public.profiles
  SET 
    name = COALESCE(NEW.personal_info->>'name', name),
    company_name = COALESCE(NEW.business_info->>'company_name', company_name),
    industry = COALESCE(NEW.business_info->>'company_sector', industry),
    onboarding_completed = NEW.is_completed,
    onboarding_completed_at = CASE WHEN NEW.is_completed THEN NEW.completed_at ELSE NULL END
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS sync_onboarding_final_to_profile ON public.onboarding_final;
CREATE TRIGGER sync_onboarding_final_to_profile
  AFTER INSERT OR UPDATE ON public.onboarding_final
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_onboarding_final_to_profile();

-- 4. Remover a tabela onboarding_sync (após migração)
-- DROP TABLE IF EXISTS public.onboarding_sync;