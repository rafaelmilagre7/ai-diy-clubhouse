-- ✅ Políticas RLS para unified_checklists
-- Problema: Tabela tem RLS habilitado mas sem políticas, bloqueando todos os acessos

-- 1. Usuários podem ver seus próprios checklists
CREATE POLICY "users_can_view_own_checklists"
ON public.unified_checklists
FOR SELECT
USING (
  auth.uid() = user_id 
  OR is_template = true  -- Todos podem ver templates
);

-- 2. Usuários podem criar seus próprios checklists
CREATE POLICY "users_can_create_own_checklists"
ON public.unified_checklists
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND is_template = false  -- Usuários comuns não podem criar templates
);

-- 3. Usuários podem atualizar seus próprios checklists
CREATE POLICY "users_can_update_own_checklists"
ON public.unified_checklists
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Usuários podem deletar seus próprios checklists
CREATE POLICY "users_can_delete_own_checklists"
ON public.unified_checklists
FOR DELETE
USING (auth.uid() = user_id);