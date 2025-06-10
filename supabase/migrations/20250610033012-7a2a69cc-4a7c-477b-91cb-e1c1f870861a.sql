
-- CORREÇÃO DEFINITIVA: LIMPEZA E REAPLICAÇÃO DAS POLÍTICAS DA TABELA PROFILES
-- ============================================================================

-- ETAPA 1: REMOÇÃO COMPLETA DE TODAS AS POLÍTICAS EXISTENTES
-- ===========================================================

-- Remover todas as políticas conhecidas
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
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "safe_profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "safe_profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "safe_profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "safe_profiles_delete_policy" ON public.profiles;

-- Remoção dinâmica de políticas restantes
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
END $$;

-- ETAPA 2: GARANTIR QUE RLS ESTÁ ATIVO
-- ====================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ETAPA 3: APLICAÇÃO DAS 4 POLÍTICAS SEGURAS
-- ===========================================

-- POLÍTICA 1: SELECT - Sem recursão
CREATE POLICY "final_profiles_select_policy" ON public.profiles
  FOR SELECT 
  USING (
    auth.uid() = id 
    OR 
    public.is_user_admin(auth.uid())
    OR 
    true
  );

-- POLÍTICA 2: INSERT - Apenas próprio usuário
CREATE POLICY "final_profiles_insert_policy" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- POLÍTICA 3: UPDATE - Próprio usuário ou admin
CREATE POLICY "final_profiles_update_policy" ON public.profiles
  FOR UPDATE 
  USING (
    auth.uid() = id 
    OR 
    public.is_user_admin(auth.uid())
  );

-- POLÍTICA 4: DELETE - Apenas admins
CREATE POLICY "final_profiles_delete_policy" ON public.profiles
  FOR DELETE 
  USING (public.is_user_admin(auth.uid()));
