-- Atualizar política de SELECT para permitir ler estruturas de checklist de outros usuários da mesma solução
-- (apenas para obter a estrutura base, não o progresso individual)
DROP POLICY IF EXISTS unified_select_authenticated ON unified_checklists;

CREATE POLICY unified_select_authenticated ON unified_checklists
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND (
      user_id = auth.uid() 
      OR is_template = true
      OR solution_id IN (
        -- Permitir ler checklist de outros usuários da mesma solução (apenas estrutura)
        SELECT DISTINCT solution_id 
        FROM unified_checklists 
        WHERE solution_id = unified_checklists.solution_id
      )
    )
  );