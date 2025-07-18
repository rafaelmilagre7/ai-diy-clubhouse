-- =============================================
-- FASE 1.3: CORREÇÃO MÍNIMA E DIRETA
-- =============================================

-- 1. PRIMEIRA - TENTAR REMOVER POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "profiles_secure_access" ON public.profiles;

-- 2. RECRIAR FUNÇÃO is_user_admin COM IMPLEMENTAÇÃO MAIS SIMPLES
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Implementação simples para evitar recursão
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id 
    AND ur.name = 'admin'
    AND user_id = auth.uid()
  );
END;
$$;

-- 3. GARANTIR PERFIS PARA USUÁRIOS SEM PERFIL
INSERT INTO public.profiles (id, email, name, role_id, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', 'Usuário'),
  (SELECT id FROM public.user_roles WHERE name IN ('membro_club', 'member') LIMIT 1),
  NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- 4. GARANTIR role_id para perfis sem role
UPDATE public.profiles 
SET role_id = (
  SELECT id FROM public.user_roles 
  WHERE name IN ('membro_club', 'member') 
  LIMIT 1
)
WHERE role_id IS NULL;

-- 5. VERIFICAR RESULTADO
SELECT 
  'Usuários sem perfil' as status,
  COUNT(*) as count
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
UNION ALL
SELECT 
  'Perfis sem role_id' as status,
  COUNT(*) as count  
FROM public.profiles
WHERE role_id IS NULL;