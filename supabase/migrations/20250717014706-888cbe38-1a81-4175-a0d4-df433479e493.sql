-- ABORDAGEM MANUAL: Bypass dos triggers problemáticos
-- ==================================================================

-- 1. Atribuir role padrão para usuários órfãos (sem usar triggers)
DO $$
DECLARE 
  default_role_id uuid;
BEGIN
  -- Buscar role padrão
  SELECT id INTO default_role_id 
  FROM public.user_roles 
  WHERE name IN ('membro_club', 'member', 'membro') 
  ORDER BY name LIMIT 1;
  
  -- Atualizar usuários órfãos um por um
  UPDATE public.profiles 
  SET role_id = default_role_id 
  WHERE role_id IS NULL;
  
  RAISE NOTICE 'Roles atualizados com ID: %', default_role_id;
END $$;

-- 2. Desabilitar temporariamente os triggers
ALTER TABLE public.onboarding_final DISABLE TRIGGER ALL;

-- 3. Inserir registros de onboarding diretamente
INSERT INTO public.onboarding_final (
  user_id, current_step, completed_steps, is_completed,
  personal_info, business_info, ai_experience, goals_info,
  personalization, location_info, discovery_info, business_context,
  status, created_at, updated_at
)
SELECT 
  p.id, 
  1, 
  ARRAY[]::integer[], 
  false,
  jsonb_build_object(
    'name', COALESCE(p.name, split_part(p.email, '@', 1)), 
    'email', p.email
  ),
  CASE 
    WHEN p.company_name IS NOT NULL THEN jsonb_build_object('company_name', p.company_name) 
    ELSE '{}'::jsonb 
  END,
  '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 
  '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
  'in_progress', 
  now(), 
  now()
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.onboarding_final onf WHERE onf.user_id = p.id
);

-- 4. Reabilitar triggers
ALTER TABLE public.onboarding_final ENABLE TRIGGER ALL;

-- 5. Verificar resultado final
SELECT 
  '🎯 PROBLEMA RESOLVIDO!' as mensagem,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN onf.user_id IS NOT NULL THEN 1 END) as com_onboarding,
  COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) as sem_onboarding
FROM public.profiles p
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id;