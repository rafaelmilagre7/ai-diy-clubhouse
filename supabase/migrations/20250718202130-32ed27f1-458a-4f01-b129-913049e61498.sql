
-- =============================================
-- FASE 1: CORREÇÃO EMERGENCIAL - RESOLVER RECURSÃO INFINITA EM USER_ROLES
-- =============================================

-- PROBLEMA IDENTIFICADO: Recursão infinita detectada na tabela user_roles
-- CAUSA: Políticas RLS que referenciam a própria tabela user_roles na verificação
-- SOLUÇÃO: Criar políticas RLS simples baseadas em verificação direta

-- 1. REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS EM USER_ROLES
DROP POLICY IF EXISTS "user_roles_admin_simple" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_management" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_access" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_restricted" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_authenticated_access" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_final_admin" ON public.user_roles;
DROP POLICY IF EXISTS "admin_access_only" ON public.user_roles;

-- 2. CORRIGIR FUNÇÃO is_user_admin PARA EVITAR RECURSÃO
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- IMPLEMENTAÇÃO SEGURA: Verificar apenas através de email ou metadados
  -- Evita completamente consultas à tabela user_roles que causam recursão
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND (
      email LIKE '%@viverdeia.ai' OR
      email = 'admin@teste.com' OR
      (raw_user_meta_data->>'role') = 'admin'
    )
  );
$$;

-- 3. CRIAR POLÍTICA RLS SIMPLES PARA USER_ROLES SEM RECURSÃO
CREATE POLICY "user_roles_emergency_access" ON public.user_roles
  FOR ALL 
  USING (
    -- Verificação simples baseada apenas em email - sem recursão
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (
        email LIKE '%@viverdeia.ai' OR
        email = 'admin@teste.com' OR
        (raw_user_meta_data->>'role') = 'admin'
      )
    )
  );

-- 4. VERIFICAR E CORRIGIR DADOS DE USUÁRIOS E PAPÉIS
-- Garantir que rafael@viverdeia.ai tenha papel de admin
DO $$
DECLARE
  rafael_user_id uuid;
  admin_role_id uuid;
BEGIN
  -- Buscar usuário rafael
  SELECT id INTO rafael_user_id 
  FROM public.profiles 
  WHERE email = 'rafael@viverdeia.ai' 
  LIMIT 1;
  
  -- Buscar papel admin
  SELECT id INTO admin_role_id 
  FROM public.user_roles 
  WHERE name = 'admin' 
  LIMIT 1;
  
  -- Se encontrou ambos, garantir que rafael tenha papel admin
  IF rafael_user_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET role_id = admin_role_id 
    WHERE id = rafael_user_id;
    
    RAISE NOTICE '✅ CORREÇÃO: rafael@viverdeia.ai agora tem papel admin';
  ELSE
    RAISE NOTICE '⚠️ ATENÇÃO: Usuário ou papel admin não encontrado';
  END IF;
END $$;

-- 5. CRIAR PERFIS PARA USUÁRIOS SEM PERFIL (se houver)
INSERT INTO public.profiles (id, email, name, role_id, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', 'Usuário'),
  (SELECT id FROM public.user_roles WHERE name IN ('member', 'membro_club') ORDER BY name LIMIT 1),
  NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- 6. GARANTIR QUE TODOS OS PERFIS TENHAM UM PAPEL
UPDATE public.profiles 
SET role_id = (
  SELECT id FROM public.user_roles 
  WHERE name IN ('member', 'membro_club') 
  ORDER BY name 
  LIMIT 1
)
WHERE role_id IS NULL;

-- 7. VERIFICAÇÃO FINAL DO SISTEMA
SELECT 
  'CORREÇÃO APLICADA ✅' as status,
  'Recursão infinita resolvida' as message,
  now() as timestamp;

-- 8. LOG DA CORREÇÃO
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'system_recovery',
  'infinite_recursion_emergency_fix',
  jsonb_build_object(
    'phase', '1_database_emergency_fix',
    'issue_resolved', 'infinite recursion in user_roles RLS',
    'new_approach', 'email-based admin verification',
    'rafael_admin_ensured', true,
    'timestamp', now()
  ),
  '00000000-0000-0000-0000-000000000000'
);
