-- SOLUÇÃO SIMPLES: Apenas corrigir usuários órfãos sem mexer na função
-- ==================================================================

-- 1. Atribuir role padrão para usuários com role_id NULL
UPDATE public.profiles 
SET role_id = (
  SELECT id FROM public.user_roles 
  WHERE name IN ('membro_club', 'member', 'membro') 
  ORDER BY name LIMIT 1
)
WHERE role_id IS NULL;

-- 2. Inicialização SIMPLES para usuários órfãos (sem trigger complexo)
DO $$
DECLARE 
  user_record RECORD;
  onboarding_id uuid;
BEGIN
  FOR user_record IN 
    SELECT p.id, p.name, p.email, p.company_name, au.raw_user_meta_data
    FROM public.profiles p
    LEFT JOIN auth.users au ON p.id = au.id
    LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id
    WHERE onf.user_id IS NULL
  LOOP
    INSERT INTO public.onboarding_final (
      user_id,
      current_step,
      completed_steps,
      is_completed,
      personal_info,
      business_info,
      ai_experience,
      goals_info,
      personalization,
      location_info,
      discovery_info,
      business_context,
      status,
      created_at,
      updated_at
    )
    VALUES (
      user_record.id,
      1,
      ARRAY[]::integer[],
      false,
      jsonb_build_object(
        'name', COALESCE(
          user_record.name,
          user_record.raw_user_meta_data->>'name',
          split_part(user_record.email, '@', 1)
        ),
        'email', user_record.email
      ),
      CASE 
        WHEN user_record.company_name IS NOT NULL THEN 
          jsonb_build_object('company_name', user_record.company_name)
        ELSE '{}'::jsonb
      END,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      'in_progress',
      now(),
      now()
    )
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO onboarding_id;
    
    RAISE NOTICE 'Onboarding criado para usuário %: %', user_record.email, onboarding_id;
  END LOOP;
END $$;

-- 3. Verificação final
SELECT 
  '🎯 PROBLEMA RESOLVIDO!' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) as usuarios_sem_onboarding,
  COUNT(CASE WHEN onf.user_id IS NOT NULL THEN 1 END) as usuarios_com_onboarding
FROM public.profiles p
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id;