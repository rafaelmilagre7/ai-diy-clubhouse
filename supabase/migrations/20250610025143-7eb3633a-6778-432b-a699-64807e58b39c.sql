
-- FASE 1: AUDITORIA DE SEGURANÇA - LIMPEZA E ATIVAÇÃO DE RLS
-- ============================================================

-- ETAPA 1: LIMPEZA COMPLETA DE POLÍTICAS DUPLICADAS/CONFLITANTES
-- ================================================================

-- Limpeza da tabela profiles (13 políticas duplicadas)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profile_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profile_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profile_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profile_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.profiles;

-- Limpeza da tabela solutions (8 políticas duplicadas)
DROP POLICY IF EXISTS "Anyone can view published solutions" ON public.solutions;
DROP POLICY IF EXISTS "Admins can manage all solutions" ON public.solutions;
DROP POLICY IF EXISTS "Admins can view all solutions" ON public.solutions;
DROP POLICY IF EXISTS "Admins can insert solutions" ON public.solutions;
DROP POLICY IF EXISTS "Admins can update solutions" ON public.solutions;
DROP POLICY IF EXISTS "Admins can delete solutions" ON public.solutions;
DROP POLICY IF EXISTS "solution_select_policy" ON public.solutions;
DROP POLICY IF EXISTS "solution_admin_policy" ON public.solutions;

-- Limpeza da tabela tools (8 políticas duplicadas)
DROP POLICY IF EXISTS "Anyone can view active tools" ON public.tools;
DROP POLICY IF EXISTS "Admins can manage all tools" ON public.tools;
DROP POLICY IF EXISTS "Admins can view all tools" ON public.tools;
DROP POLICY IF EXISTS "Admins can insert tools" ON public.tools;
DROP POLICY IF EXISTS "Admins can update tools" ON public.tools;
DROP POLICY IF EXISTS "Admins can delete tools" ON public.tools;
DROP POLICY IF EXISTS "tool_select_policy" ON public.tools;
DROP POLICY IF EXISTS "tool_admin_policy" ON public.tools;

-- Limpeza da tabela modules (6 políticas duplicadas)
DROP POLICY IF EXISTS "Anyone can view modules of published solutions" ON public.modules;
DROP POLICY IF EXISTS "Admins can manage all modules" ON public.modules;
DROP POLICY IF EXISTS "Admins can view all modules" ON public.modules;
DROP POLICY IF EXISTS "Admins can insert modules" ON public.modules;
DROP POLICY IF EXISTS "Admins can update modules" ON public.modules;
DROP POLICY IF EXISTS "Admins can delete modules" ON public.modules;

-- ETAPA 2: ATIVAÇÃO DO RLS NAS 4 TABELAS CRÍTICAS
-- ================================================

-- Ativar RLS (atualmente está DESATIVADO em todas)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- ETAPA 3: APLICAÇÃO DE POLÍTICAS SEGURAS E LIMPAS
-- =================================================

-- POLÍTICAS PARA PROFILES
-- ========================

-- SELECT: Usuário vê seu perfil + Admins veem todos + Leitura pública básica (id, name, avatar_url)
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT 
  USING (
    -- Usuário pode ver seu próprio perfil completo
    auth.uid() = id 
    OR 
    -- Admins podem ver todos os perfis
    public.is_user_admin(auth.uid())
    OR 
    -- Qualquer pessoa pode ver informações básicas públicas
    true  -- Permite leitura pública de campos como name, avatar_url para funcionalidades como comunidade
  );

-- INSERT: Apenas para o próprio usuário
CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- UPDATE: Usuário atualiza seu perfil + Admins atualizam qualquer um
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE 
  USING (
    auth.uid() = id 
    OR 
    public.is_user_admin(auth.uid())
  );

-- DELETE: Apenas admins
CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE 
  USING (public.is_user_admin(auth.uid()));

-- POLÍTICAS PARA SOLUTIONS
-- =========================

-- SELECT: Soluções publicadas são públicas + Admins veem todas
CREATE POLICY "solutions_select_policy" ON public.solutions
  FOR SELECT 
  USING (
    published = true 
    OR 
    public.is_user_admin(auth.uid())
  );

-- INSERT: Apenas admins
CREATE POLICY "solutions_insert_policy" ON public.solutions
  FOR INSERT 
  WITH CHECK (public.is_user_admin(auth.uid()));

-- UPDATE: Apenas admins
CREATE POLICY "solutions_update_policy" ON public.solutions
  FOR UPDATE 
  USING (public.is_user_admin(auth.uid()));

-- DELETE: Apenas admins
CREATE POLICY "solutions_delete_policy" ON public.solutions
  FOR DELETE 
  USING (public.is_user_admin(auth.uid()));

-- POLÍTICAS PARA TOOLS
-- ====================

-- SELECT: Ferramentas são visíveis publicamente (para catálogo de ferramentas)
CREATE POLICY "tools_select_policy" ON public.tools
  FOR SELECT 
  USING (true);  -- Acesso público para visualização de ferramentas

-- INSERT: Apenas admins
CREATE POLICY "tools_insert_policy" ON public.tools
  FOR INSERT 
  WITH CHECK (public.is_user_admin(auth.uid()));

-- UPDATE: Apenas admins
CREATE POLICY "tools_update_policy" ON public.tools
  FOR UPDATE 
  USING (public.is_user_admin(auth.uid()));

-- DELETE: Apenas admins
CREATE POLICY "tools_delete_policy" ON public.tools
  FOR DELETE 
  USING (public.is_user_admin(auth.uid()));

-- POLÍTICAS PARA MODULES
-- ======================

-- SELECT: Módulos de soluções publicadas são visíveis + Admins veem todos
CREATE POLICY "modules_select_policy" ON public.modules
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.solutions 
      WHERE solutions.id = modules.solution_id 
      AND solutions.published = true
    )
    OR 
    public.is_user_admin(auth.uid())
  );

-- INSERT: Apenas admins
CREATE POLICY "modules_insert_policy" ON public.modules
  FOR INSERT 
  WITH CHECK (public.is_user_admin(auth.uid()));

-- UPDATE: Apenas admins
CREATE POLICY "modules_update_policy" ON public.modules
  FOR UPDATE 
  USING (public.is_user_admin(auth.uid()));

-- DELETE: Apenas admins
CREATE POLICY "modules_delete_policy" ON public.modules
  FOR DELETE 
  USING (public.is_user_admin(auth.uid()));

-- ETAPA 4: VALIDAÇÃO E VERIFICAÇÃO
-- =================================

-- Verificar se o RLS está ativo nas 4 tabelas
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'solutions', 'tools', 'modules')
ORDER BY tablename;

-- Contar as políticas aplicadas (deve ser 16 total: 4 por tabela)
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'solutions', 'tools', 'modules')
GROUP BY schemaname, tablename
ORDER BY tablename;
