
-- CORREÇÃO CRÍTICA: Resolver recursão infinita nas políticas RLS
-- ===============================================================================

-- ETAPA 1: CORRIGIR FUNÇÃO is_user_admin SEM RECURSÃO
-- ====================================================

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- NOVA IMPLEMENTAÇÃO: Usar user_metadata do JWT sem acessar tabela profiles
  -- Isso evita completamente a recursão infinita nas políticas RLS
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
    false
  )
  -- Verificação de segurança: apenas para o usuário autenticado atual
  WHERE user_id = auth.uid();
$$;

-- ETAPA 2: CORRIGIR FUNÇÃO get_user_permissions COM ASSINATURA CORRETA
-- ===================================================================

CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id UUID)
RETURNS SETOF TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH user_role AS (
    SELECT role_id
    FROM public.profiles
    WHERE id = user_id
  ),
  all_permissions AS (
    -- Verifica se o usuário tem papel com permissão 'all'
    SELECT 
      CASE 
        WHEN EXISTS (
          SELECT 1 
          FROM user_role ur
          JOIN public.user_roles r ON r.id = ur.role_id
          WHERE r.permissions->>'all' = 'true'
        )
        THEN 'admin.all'::TEXT
        ELSE NULL
      END AS permission_code
    
    UNION ALL
    
    -- Busca permissões específicas do papel do usuário
    SELECT pd.code
    FROM user_role ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    JOIN public.permission_definitions pd ON pd.id = rp.permission_id
  )
  SELECT permission_code
  FROM all_permissions
  WHERE permission_code IS NOT NULL;
END;
$$;

-- ETAPA 3: REMOVER POLÍTICA PROBLEMÁTICA QUE CAUSA RECURSÃO
-- =========================================================

DROP POLICY IF EXISTS "user_roles_admin_management" ON public.user_roles;

-- ETAPA 4: CRIAR POLÍTICA SIMPLES SEM RECURSÃO
-- ============================================

CREATE POLICY "user_roles_admin_simple" 
  ON public.user_roles 
  FOR ALL
  USING (
    -- Verificação simples baseada em email ou metadata sem JOIN
    auth.uid() IS NOT NULL AND (
      -- Admin baseado em email
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email LIKE '%@viverdeia.ai'
      )
      OR
      -- Admin baseado em metadata
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    )
  );

-- ETAPA 5: CRIAR FUNÇÃO AUXILIAR PARA VERIFICAR ROLE ATUAL
-- ========================================================

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
    'member'
  );
$$;

-- ETAPA 6: VERIFICAR SE AS FUNÇÕES FORAM ATUALIZADAS CORRETAMENTE
-- ==============================================================

-- Buscar a definição atual da função para confirmar a mudança
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname IN ('is_user_admin', 'get_user_permissions') 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- RESULTADO ESPERADO:
-- - Função is_user_admin sem recursão (usa apenas JWT)
-- - Função get_user_permissions com assinatura correta
-- - Política RLS simples sem JOINs problemáticos
-- - Eliminação da recursão infinita
-- - Performance melhorada (acesso direto ao JWT)
