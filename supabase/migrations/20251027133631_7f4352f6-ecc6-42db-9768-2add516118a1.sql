-- =====================================================
-- CORREÇÃO: Relacionamento solution_tools -> tools via ID
-- Corrige problema de logos não aparecerem nas soluções
-- =====================================================

-- 1. Adicionar coluna tool_id se não existir
ALTER TABLE solution_tools 
ADD COLUMN IF NOT EXISTS tool_id UUID;

-- 2. Popular tool_id para registros existentes baseado em tool_name
UPDATE solution_tools st
SET tool_id = t.id
FROM tools t
WHERE st.tool_name = t.name
  AND st.tool_id IS NULL;

-- 3. Adicionar foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_solution_tools_tool_id'
  ) THEN
    ALTER TABLE solution_tools
    ADD CONSTRAINT fk_solution_tools_tool_id 
    FOREIGN KEY (tool_id) 
    REFERENCES tools(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Tornar tool_id obrigatório
ALTER TABLE solution_tools
ALTER COLUMN tool_id SET NOT NULL;

-- 5. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_solution_tools_tool_id 
ON solution_tools(tool_id);

-- 6. Validação: verificar se todos os registros têm tool_id
DO $$
DECLARE
  missing_count INTEGER;
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM solution_tools;
  SELECT COUNT(*) INTO missing_count FROM solution_tools WHERE tool_id IS NULL;
  
  IF missing_count > 0 THEN
    RAISE EXCEPTION '❌ ERRO: % de % registros em solution_tools sem tool_id', missing_count, total_count;
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SUCESSO: Todos os % registros têm tool_id vinculado!', total_count;
  RAISE NOTICE '========================================';
END $$;