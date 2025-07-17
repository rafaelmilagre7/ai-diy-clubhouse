-- CORREÇÃO FINAL SIMPLIFICADA: Apenas corrigir dados sem mexer na função
-- ==================================================================

-- 1. Verificar estado atual
SELECT 
  '📊 ESTADO ANTES DA CORREÇÃO' as status,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role_id IS NULL THEN 1 END) as sem_role,
  COUNT(CASE WHEN role_id IS NOT NULL THEN 1 END) as com_role
FROM public.profiles;

-- 2. Garantir que existe pelo menos um role válido no sistema
INSERT INTO public.user_roles (id, name, description, permissions)
SELECT 
  gen_random_uuid(),
  'member',
  'Membro padrão do sistema',
  '{"read": true}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE name IN ('member', 'membro', 'membro_club')
);

-- 3. Atribuir role válido a TODOS os usuários com role_id NULL ou inválido
UPDATE public.profiles 
SET role_id = (
  SELECT id FROM public.user_roles 
  WHERE name IN ('member', 'membro', 'membro_club') 
  ORDER BY 
    CASE 
      WHEN name = 'member' THEN 1
      WHEN name = 'membro' THEN 2  
      WHEN name = 'membro_club' THEN 3
      ELSE 4
    END
  LIMIT 1
),
updated_at = now()
WHERE role_id IS NULL 
   OR NOT EXISTS (
     SELECT 1 FROM public.user_roles ur 
     WHERE ur.id = profiles.role_id
   );

-- 4. Verificar quantos roles foram corrigidos
SELECT 
  '🔧 ROLES CORRIGIDOS' as etapa,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role_id IS NULL THEN 1 END) as ainda_sem_role
FROM public.profiles;

-- 5. Inserir onboarding para TODOS os usuários órfãos restantes
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
    'email', p.email,
    'auto_generated', true,
    'correction_timestamp', now()::text
  ),
  CASE 
    WHEN p.company_name IS NOT NULL THEN 
      jsonb_build_object('company_name', p.company_name) 
    ELSE '{}'::jsonb 
  END,
  '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 
  '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
  'in_progress', 
  now(), 
  now()
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.onboarding_final onf 
  WHERE onf.user_id = p.id
)
AND p.role_id IS NOT NULL -- Só processar usuários com role válido
ON CONFLICT (user_id) DO UPDATE SET
  personal_info = onboarding_final.personal_info || EXCLUDED.personal_info,
  business_info = onboarding_final.business_info || EXCLUDED.business_info,
  updated_at = now();

-- 6. RESULTADO FINAL DEFINITIVO
SELECT 
  '🎉 CORREÇÃO FINAL CONCLUÍDA!' as resultado,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN p.role_id IS NULL THEN 1 END) as usuarios_sem_role,
  COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) as usuarios_sem_onboarding,
  COUNT(CASE WHEN p.role_id IS NOT NULL AND onf.user_id IS NOT NULL THEN 1 END) as usuarios_completos,
  ROUND(
    (COUNT(CASE WHEN p.role_id IS NOT NULL AND onf.user_id IS NOT NULL THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 
    2
  ) as porcentagem_sucesso,
  CASE 
    WHEN COUNT(CASE WHEN p.role_id IS NULL THEN 1 END) = 0 
         AND COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) = 0 
    THEN '✅ PROBLEMA COMPLETAMENTE RESOLVIDO!' 
    ELSE CONCAT('⚠️ Restam: ', 
                COUNT(CASE WHEN p.role_id IS NULL THEN 1 END), ' sem role, ',
                COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END), ' sem onboarding')
  END as status_detalhado
FROM public.profiles p
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id;