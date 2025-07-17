-- CORREÇÃO DO TRIGGER sync_onboarding_final_to_profile
-- ==================================================================

-- 1. Corrigir trigger removendo referências a campos que não existem mais
CREATE OR REPLACE FUNCTION public.sync_onboarding_final_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log para debug
  RAISE NOTICE 'Sincronizando onboarding_final para profile do usuário: %', NEW.user_id;
  
  -- Atualizar perfil APENAS com dados dos campos JSONB (sem referenciar NEW.company_name)
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
  
  RETURN NEW;
END;
$$;

-- 2. Agora inserir onboarding para usuários órfãos
INSERT INTO public.onboarding_final (
  user_id, current_step, completed_steps, is_completed,
  personal_info, business_info, ai_experience, goals_info,
  personalization, location_info, discovery_info, business_context,
  status, created_at, updated_at
)
SELECT 
  p.id, 1, ARRAY[]::integer[], false,
  jsonb_build_object(
    'name', COALESCE(p.name, split_part(p.email, '@', 1)), 
    'email', p.email
  ),
  CASE 
    WHEN p.company_name IS NOT NULL THEN 
      jsonb_build_object('company_name', p.company_name) 
    ELSE '{}'::jsonb 
  END,
  '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 
  '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
  'in_progress', now(), now()
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.onboarding_final onf WHERE onf.user_id = p.id)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Verificar resultado final
SELECT 
  '🎉 CORREÇÃO APLICADA COM SUCESSO!' as status,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN onf.user_id IS NOT NULL THEN 1 END) as usuarios_com_onboarding,
  COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) as usuarios_sem_onboarding
FROM public.profiles p
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id;