-- Adicionar campo para distinguir entre templates de admin e progresso de usuário
ALTER TABLE implementation_checkpoints 
ADD COLUMN is_template BOOLEAN DEFAULT FALSE;

-- Adicionar campo para referenciar o template original
ALTER TABLE implementation_checkpoints 
ADD COLUMN template_id UUID REFERENCES implementation_checkpoints(id);

-- Atualizar política para permitir que todos vejam templates de admin
DROP POLICY IF EXISTS "Users can view their own checkpoints" ON implementation_checkpoints;

CREATE POLICY "Users can view checkpoints" ON implementation_checkpoints
FOR SELECT 
USING (
  -- Próprios registros do usuário
  auth.uid() = user_id 
  OR 
  -- Templates criados por admins (visíveis para todos)
  (is_template = true AND EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = implementation_checkpoints.user_id 
    AND ur.name = 'admin'
  ))
);

-- Atualizar política de insert para permitir que admins criem templates
DROP POLICY IF EXISTS "Users can create their own checkpoints" ON implementation_checkpoints;

CREATE POLICY "Users can create checkpoints" ON implementation_checkpoints
FOR INSERT 
WITH CHECK (
  -- Usuários podem criar seus próprios registros
  auth.uid() = user_id
  OR
  -- Admins podem criar templates
  (is_template = true AND EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  ))
);

-- Marcar o registro existente da Anna Julia como template
UPDATE implementation_checkpoints 
SET is_template = true 
WHERE user_id = 'a6eaa06c-a75a-4103-a88d-bce2b25f00b4' 
AND solution_id = 'da511101-5ba8-43a1-8a0a-ecb388938550';

-- Adicionar índices para otimização
CREATE INDEX IF NOT EXISTS idx_implementation_checkpoints_template 
ON implementation_checkpoints(solution_id, is_template) 
WHERE is_template = true;

CREATE INDEX IF NOT EXISTS idx_implementation_checkpoints_user_solution 
ON implementation_checkpoints(user_id, solution_id) 
WHERE is_template = false;