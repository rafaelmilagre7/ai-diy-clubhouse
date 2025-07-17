-- CRIAR FUNÇÃO MISSING E FAZER CORREÇÃO FINAL DOS DADOS
-- ==================================================================

-- 1. Primeiro, criar a função is_user_admin que está faltando
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Verificar se o usuário é admin pelo role
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id 
    AND ur.name = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar false por segurança
    RETURN false;
END;
$$;

-- 2. Verificar estado atual
SELECT 
  '📊 ESTADO ANTES DA CORREÇÃO' as status,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role_id IS NULL THEN 1 END) as sem_role,
  COUNT(CASE WHEN role_id IS NOT NULL THEN 1 END) as com_role
FROM public.profiles;

-- 3. Garantir que existe role 'member' no sistema
INSERT INTO public.user_roles (id, name, description, permissions)
SELECT 
  gen_random_uuid(),
  'member',
  'Membro padrão do sistema',
  '{"read": true, "basic_access": true}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE name = 'member'
);

-- 4. Atribuir role 'member' a TODOS os usuários com role_id NULL ou inválido
UPDATE public.profiles 
SET role_id = (
  SELECT id FROM public.user_roles 
  WHERE name = 'member'
  LIMIT 1
),
updated_at = now()
WHERE role_id IS NULL 
   OR NOT EXISTS (
     SELECT 1 FROM public.user_roles ur 
     WHERE ur.id = profiles.role_id
   );

-- 5. Verificar quantos foram corrigidos
SELECT 
  '🔧 ROLES ATRIBUÍDOS' as etapa,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role_id IS NULL THEN 1 END) as ainda_sem_role,
  COUNT(CASE WHEN ur.name = 'member' THEN 1 END) as com_role_member
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id;

-- 6. Inserir onboarding para usuários órfãos (apenas os com role válido)
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
    'auto_created', true,
    'created_by_migration', true,
    'timestamp', now()::text
  ),
  CASE 
    WHEN p.company_name IS NOT NULL AND p.company_name != '' THEN 
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
AND p.role_id IS NOT NULL -- Só criar para usuários com role válido
ON CONFLICT (user_id) DO NOTHING;

-- 7. RESULTADO FINAL COMPLETO
SELECT 
  '🎉 CORREÇÃO FINAL EXECUTADA COM SUCESSO!' as resultado,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN p.role_id IS NULL THEN 1 END) as usuarios_sem_role,
  COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) as usuarios_sem_onboarding,
  COUNT(CASE WHEN p.role_id IS NOT NULL AND onf.user_id IS NOT NULL THEN 1 END) as usuarios_completos,
  ROUND(
    (COUNT(CASE WHEN p.role_id IS NOT NULL AND onf.user_id IS NOT NULL THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 
    1
  ) as taxa_sucesso_percentual,
  CASE 
    WHEN COUNT(CASE WHEN p.role_id IS NULL THEN 1 END) = 0 
         AND COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END) = 0 
    THEN '✅ TODOS OS PROBLEMAS RESOLVIDOS! Sistema operacional.' 
    ELSE CONCAT('⚠️ Problemas restantes: ', 
                COUNT(CASE WHEN p.role_id IS NULL THEN 1 END), ' usuários sem role + ',
                COUNT(CASE WHEN onf.user_id IS NULL THEN 1 END), ' usuários sem onboarding')
  END as status_final_detalhado
FROM public.profiles p
LEFT JOIN public.onboarding_final onf ON p.id = onf.user_id;