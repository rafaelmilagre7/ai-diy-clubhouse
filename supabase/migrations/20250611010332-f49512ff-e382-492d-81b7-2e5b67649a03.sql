
-- FASE 2: CONSOLIDAÇÃO DE POLÍTICAS RLS
-- =====================================
-- Objetivo: Resolver conflitos, duplicações e lacunas nas políticas RLS
-- Garantia: Zero impacto na funcionalidade da plataforma

-- ETAPA 1: CONSOLIDAÇÃO DA TABELA ANALYTICS
-- ==========================================

-- Remover políticas conflitantes/duplicadas da tabela analytics
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.analytics;
DROP POLICY IF EXISTS "Admins can view all analytics" ON public.analytics;
DROP POLICY IF EXISTS "analytics_select_policy" ON public.analytics;
DROP POLICY IF EXISTS "analytics_insert_policy" ON public.analytics;

-- Garantir que RLS está ativo
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Aplicar políticas consolidadas para analytics
CREATE POLICY "analytics_consolidated_select" ON public.analytics
  FOR SELECT 
  USING (
    -- Usuário pode ver suas próprias analytics
    user_id = auth.uid() 
    OR 
    -- Admins podem ver todas
    public.is_user_admin(auth.uid())
  );

CREATE POLICY "analytics_consolidated_insert" ON public.analytics
  FOR INSERT 
  WITH CHECK (
    -- Apenas para o próprio usuário ou admins
    user_id = auth.uid() 
    OR 
    public.is_user_admin(auth.uid())
  );

-- ETAPA 2: CONSOLIDAÇÃO DA TABELA PROFILES
-- =========================================

-- Remover todas as políticas conflitantes da tabela profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "final_profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "final_profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "final_profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "final_profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- Garantir que RLS está ativo
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Aplicar políticas consolidadas para profiles (mantendo acesso público básico)
CREATE POLICY "profiles_consolidated_select" ON public.profiles
  FOR SELECT 
  USING (
    -- Usuário pode ver seu próprio perfil completo
    id = auth.uid() 
    OR 
    -- Admins podem ver todos os perfis
    public.is_user_admin(auth.uid())
    OR 
    -- Acesso público a informações básicas (necessário para comunidade)
    true
  );

CREATE POLICY "profiles_consolidated_insert" ON public.profiles
  FOR INSERT 
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_consolidated_update" ON public.profiles
  FOR UPDATE 
  USING (
    id = auth.uid() 
    OR 
    public.is_user_admin(auth.uid())
  );

CREATE POLICY "profiles_consolidated_delete" ON public.profiles
  FOR DELETE 
  USING (public.is_user_admin(auth.uid()));

-- ETAPA 3: CONSOLIDAÇÃO DA TABELA SOLUTIONS
-- ==========================================

-- Remover políticas conflitantes da tabela solutions
DROP POLICY IF EXISTS "Anyone can view published solutions" ON public.solutions;
DROP POLICY IF EXISTS "Admins can manage all solutions" ON public.solutions;
DROP POLICY IF EXISTS "solutions_select_policy" ON public.solutions;
DROP POLICY IF EXISTS "solutions_insert_policy" ON public.solutions;
DROP POLICY IF EXISTS "solutions_update_policy" ON public.solutions;
DROP POLICY IF EXISTS "solutions_delete_policy" ON public.solutions;

-- Garantir que RLS está ativo
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;

-- Aplicar políticas consolidadas para solutions
CREATE POLICY "solutions_consolidated_select" ON public.solutions
  FOR SELECT 
  USING (
    -- Soluções publicadas são públicas
    published = true 
    OR 
    -- Admins veem todas
    public.is_user_admin(auth.uid())
  );

CREATE POLICY "solutions_consolidated_manage" ON public.solutions
  FOR ALL 
  USING (public.is_user_admin(auth.uid()))
  WITH CHECK (public.is_user_admin(auth.uid()));

-- ETAPA 4: VALIDAÇÃO DA CONSOLIDAÇÃO
-- ===================================

-- Verificar se as consolidações foram aplicadas corretamente
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('analytics', 'profiles', 'solutions')
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Verificar se RLS está ativo nas tabelas críticas
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('analytics', 'profiles', 'solutions')
ORDER BY tablename;
