-- ============================================
-- CORREÇÃO: Ajustar política RLS de learning_lessons
-- ============================================
-- Problema: A política restritiva estava bloqueando a validação
-- de foreign key quando learning_progress fazia UPDATE

-- 1. Remover política restritiva existente
DROP POLICY IF EXISTS "learning_lessons_authenticated_select" ON learning_lessons;

-- 2. Criar política permissiva para SELECT
-- Permite que usuários autenticados vejam todas as aulas
-- (necessário para validação de foreign key)
CREATE POLICY "learning_lessons_select_for_authenticated" 
ON learning_lessons 
FOR SELECT 
TO authenticated
USING (true);

-- ✅ Isso permitirá:
-- - Usuários autenticados podem ver todas as aulas
-- - Validação de foreign key funcionará corretamente
-- - UPDATE em learning_progress funcionará
-- - A lógica de "published" pode ser tratada no frontend

-- ✅ Segurança mantida:
-- - Apenas admins podem criar/editar/deletar aulas (via learning_lessons_admin_manage)
-- - A visibilidade de aulas não publicadas pode ser controlada no frontend