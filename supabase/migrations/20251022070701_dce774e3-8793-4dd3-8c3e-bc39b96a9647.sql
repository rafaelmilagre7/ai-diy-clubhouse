-- Políticas RLS para unified_checklists
-- Dropar políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own unified checklists" ON unified_checklists;
DROP POLICY IF EXISTS "Users can create unified checklists for own solutions" ON unified_checklists;
DROP POLICY IF EXISTS "Users can update own unified checklists" ON unified_checklists;
DROP POLICY IF EXISTS "Admins can manage all unified checklists" ON unified_checklists;

-- SELECT: usuário vê apenas seus checklists (através da solution)
CREATE POLICY "Users can view own unified checklists"
ON unified_checklists FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM ai_generated_solutions
    WHERE ai_generated_solutions.id = unified_checklists.solution_id
    AND ai_generated_solutions.user_id = auth.uid()
  )
  OR is_template = true
);

-- INSERT: usuário cria checklist para suas soluções
CREATE POLICY "Users can create unified checklists for own solutions"
ON unified_checklists FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_generated_solutions
    WHERE ai_generated_solutions.id = unified_checklists.solution_id
    AND ai_generated_solutions.user_id = auth.uid()
  )
  OR (is_template = false AND solution_id IS NOT NULL)
);

-- UPDATE: usuário atualiza seus checklists
CREATE POLICY "Users can update own unified checklists"
ON unified_checklists FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM ai_generated_solutions
    WHERE ai_generated_solutions.id = unified_checklists.solution_id
    AND ai_generated_solutions.user_id = auth.uid()
  )
);

-- Admins podem gerenciar todos os checklists
CREATE POLICY "Admins can manage all unified checklists"
ON unified_checklists FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid()
    AND ur.name = 'admin'
  )
);