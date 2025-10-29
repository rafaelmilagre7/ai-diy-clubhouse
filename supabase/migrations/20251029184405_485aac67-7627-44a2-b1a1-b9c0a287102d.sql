-- Adicionar constraint para garantir consistência entre progress_percentage e completed_at
-- Se progress_percentage >= 100, completed_at deve ser NOT NULL
-- Se progress_percentage < 100, completed_at deve ser NULL

-- Primeiro, corrigir dados inconsistentes existentes
UPDATE learning_progress 
SET completed_at = updated_at 
WHERE progress_percentage >= 100 AND completed_at IS NULL;

UPDATE learning_progress 
SET completed_at = NULL 
WHERE progress_percentage < 100 AND completed_at IS NOT NULL;

-- Adicionar constraint
ALTER TABLE learning_progress
ADD CONSTRAINT check_completed_consistency
CHECK (
  (progress_percentage >= 100 AND completed_at IS NOT NULL)
  OR 
  (progress_percentage < 100 AND completed_at IS NULL)
);

-- Criar índice para melhorar performance em queries de progresso do curso
CREATE INDEX IF NOT EXISTS idx_learning_progress_completion
ON learning_progress(user_id, progress_percentage)
WHERE progress_percentage >= 100;

-- Criar índice para queries por lição
CREATE INDEX IF NOT EXISTS idx_learning_progress_lesson_lookup
ON learning_progress(lesson_id, user_id, progress_percentage);

-- Comentários para documentação
COMMENT ON CONSTRAINT check_completed_consistency ON learning_progress IS 
'Garante que completed_at seja NOT NULL quando progress_percentage >= 100 e NULL quando < 100';

COMMENT ON INDEX idx_learning_progress_completion IS 
'Índice otimizado para cálculo de progresso do curso (aulas concluídas)';

COMMENT ON INDEX idx_learning_progress_lesson_lookup IS 
'Índice otimizado para busca de progresso por lição e usuário';