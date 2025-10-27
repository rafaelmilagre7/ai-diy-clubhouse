-- 🧹 LIMPEZA: Remover TODAS as políticas antigas e conflitantes da unified_checklists
DROP POLICY IF EXISTS "users_can_view_own_checklists" ON public.unified_checklists;
DROP POLICY IF EXISTS "users_can_create_own_checklists" ON public.unified_checklists;
DROP POLICY IF EXISTS "users_can_update_own_checklists" ON public.unified_checklists;
DROP POLICY IF EXISTS "users_can_delete_own_checklists" ON public.unified_checklists;
DROP POLICY IF EXISTS "Users can view their own checklists" ON public.unified_checklists;
DROP POLICY IF EXISTS "Users can create their own checklists" ON public.unified_checklists;
DROP POLICY IF EXISTS "Users can update their own checklists" ON public.unified_checklists;
DROP POLICY IF EXISTS "Users can delete their own checklists" ON public.unified_checklists;
DROP POLICY IF EXISTS "Users can view own unified checklists" ON public.unified_checklists;
DROP POLICY IF EXISTS "Users can create unified checklists for own solutions" ON public.unified_checklists;
DROP POLICY IF EXISTS "Users can update own unified checklists" ON public.unified_checklists;
DROP POLICY IF EXISTS "Club members can view checklist templates" ON public.unified_checklists;
DROP POLICY IF EXISTS "Admins can create templates" ON public.unified_checklists;
DROP POLICY IF EXISTS "Admins can manage all checklists" ON public.unified_checklists;
DROP POLICY IF EXISTS "Admins can manage all unified checklists" ON public.unified_checklists;

-- ✅ POLÍTICAS DEFINITIVAS E CLARAS para unified_checklists

-- 1️⃣ SELECT: Usuários veem seus próprios checklists OU templates públicos
CREATE POLICY "unified_select_policy"
ON public.unified_checklists
FOR SELECT
TO public
USING (
  auth.uid() IS NOT NULL 
  AND (
    user_id = auth.uid()  -- Próprios checklists
    OR is_template = true  -- OU templates (públicos para todos)
  )
);

-- 2️⃣ INSERT: Usuários só podem criar checklists próprios (não templates)
CREATE POLICY "unified_insert_policy"
ON public.unified_checklists
FOR INSERT
TO public
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
  AND is_template = false  -- Usuários comuns não podem criar templates
);

-- 3️⃣ UPDATE: Usuários só podem atualizar seus próprios checklists
CREATE POLICY "unified_update_policy"
ON public.unified_checklists
FOR UPDATE
TO public
USING (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
);

-- 4️⃣ DELETE: Usuários só podem deletar seus próprios checklists
CREATE POLICY "unified_delete_policy"
ON public.unified_checklists
FOR DELETE
TO public
USING (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
);

-- 5️⃣ ADMIN: Admins têm acesso total
CREATE POLICY "unified_admin_policy"
ON public.unified_checklists
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
);