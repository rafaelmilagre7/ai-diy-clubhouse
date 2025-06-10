
-- CORREÇÃO: HABILITAR RLS NA TABELA implementation_profiles
-- ========================================================

-- Habilitar RLS na tabela implementation_profiles
ALTER TABLE public.implementation_profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para implementation_profiles
-- SELECT: Usuário vê apenas seu próprio perfil + Admins veem todos
CREATE POLICY "secure_implementation_profiles_select" ON public.implementation_profiles
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR 
    public.is_admin()
  );

-- INSERT: Usuário pode criar apenas seu próprio perfil
CREATE POLICY "secure_implementation_profiles_insert" ON public.implementation_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuário atualiza apenas seu perfil + Admins atualizam qualquer um
CREATE POLICY "secure_implementation_profiles_update" ON public.implementation_profiles
  FOR UPDATE 
  USING (
    auth.uid() = user_id 
    OR 
    public.is_admin()
  );

-- DELETE: Apenas admins podem deletar
CREATE POLICY "secure_implementation_profiles_delete" ON public.implementation_profiles
  FOR DELETE 
  USING (public.is_admin());

-- VERIFICAÇÃO: Confirmar que RLS foi habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'implementation_profiles' AND schemaname = 'public') as policies_count
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'implementation_profiles';
