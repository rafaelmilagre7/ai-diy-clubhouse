-- ============================================
-- 🔧 FIX DEFINITIVO: Políticas RLS para unified_checklists
-- ============================================
-- Problema: Políticas com TO public não funcionam corretamente
-- Solução: Usar TO authenticated + verificações explícitas auth.uid()
-- ============================================

-- 🧹 LIMPEZA TOTAL: Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "unified_select_policy" ON public.unified_checklists;
DROP POLICY IF EXISTS "unified_insert_policy" ON public.unified_checklists;
DROP POLICY IF EXISTS "unified_update_policy" ON public.unified_checklists;
DROP POLICY IF EXISTS "unified_delete_policy" ON public.unified_checklists;
DROP POLICY IF EXISTS "unified_admin_policy" ON public.unified_checklists;
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

-- ============================================
-- ✅ POLÍTICAS DEFINITIVAS (SINTAXE CORRIGIDA)
-- ============================================

-- 1️⃣ SELECT: Usuários autenticados veem seus próprios checklists OU templates
CREATE POLICY "unified_select_authenticated"
ON public.unified_checklists
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (
    user_id = auth.uid()      -- Próprios checklists
    OR is_template = true      -- OU templates (públicos)
  )
);

-- 2️⃣ INSERT: Usuários autenticados criam checklists próprios (não templates)
CREATE POLICY "unified_insert_authenticated"
ON public.unified_checklists
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
  AND is_template = false      -- Usuários comuns não criam templates
);

-- 3️⃣ UPDATE: Usuários autenticados atualizam apenas seus próprios checklists
CREATE POLICY "unified_update_authenticated"
ON public.unified_checklists
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
);

-- 4️⃣ DELETE: Usuários autenticados deletam apenas seus próprios checklists
CREATE POLICY "unified_delete_authenticated"
ON public.unified_checklists
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
);

-- 5️⃣ ADMIN: Administradores têm acesso total via role
CREATE POLICY "unified_admin_full_access"
ON public.unified_checklists
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
);

-- 6️⃣ SERVICE_ROLE: Permitir edge functions criarem templates
-- Edge functions (generate-section-content) usam service_role para criar templates iniciais
CREATE POLICY "unified_service_role_access"
ON public.unified_checklists
FOR ALL
USING (
  auth.role() = 'service_role'
)
WITH CHECK (
  auth.role() = 'service_role'
);