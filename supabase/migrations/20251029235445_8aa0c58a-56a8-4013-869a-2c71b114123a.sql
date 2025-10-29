-- ============================================
-- CORREÇÃO: Políticas RLS para learning_progress
-- ============================================
-- Problema: Policy "FOR ALL" não funciona corretamente com UPDATE
-- Solução: Criar policies ESPECÍFICAS para cada operação

-- 1. Remover policy problemática
DROP POLICY IF EXISTS "learning_progress_access_final" ON learning_progress;

-- 2. Criar policies específicas para cada operação

-- Policy para VISUALIZAR progresso (SELECT)
CREATE POLICY "learning_progress_select"
ON learning_progress FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR 
  is_user_admin_secure(auth.uid())
);

-- Policy para CRIAR novo progresso (INSERT)
CREATE POLICY "learning_progress_insert"
ON learning_progress FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy para ATUALIZAR progresso (UPDATE) - ESTA É A CRÍTICA!
CREATE POLICY "learning_progress_update"
ON learning_progress FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR 
  is_user_admin_secure(auth.uid())
)
WITH CHECK (
  user_id = auth.uid() OR 
  is_user_admin_secure(auth.uid())
);

-- Policy para DELETAR progresso (DELETE)
CREATE POLICY "learning_progress_delete"
ON learning_progress FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR 
  is_user_admin_secure(auth.uid())
);

-- 3. Forçar o banco a recarregar as novas regras
NOTIFY pgrst, 'reload schema';

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Após executar esta correção:
-- ✅ Usuários poderão ATUALIZAR seu próprio progresso
-- ✅ O botão "Marcar como Concluída" funcionará
-- ✅ O modal de NPS abrirá após conclusão
-- ✅ O progresso será salvo corretamente no banco
-- ============================================