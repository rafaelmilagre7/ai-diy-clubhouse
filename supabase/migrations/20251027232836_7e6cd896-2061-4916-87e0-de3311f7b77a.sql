-- Adicionar colunas para armazenar perguntas e respostas do contexto
ALTER TABLE ai_generated_solutions 
ADD COLUMN IF NOT EXISTS questions_asked JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS user_answers JSONB DEFAULT '[]'::jsonb;

-- Adicionar comentários para documentação
COMMENT ON COLUMN ai_generated_solutions.questions_asked IS 'Perguntas feitas pela IA durante o processo de contextualização';
COMMENT ON COLUMN ai_generated_solutions.user_answers IS 'Respostas fornecidas pelo usuário às perguntas de contextualização';

-- Criar índice para busca eficiente (opcional, mas recomendado)
CREATE INDEX IF NOT EXISTS idx_ai_generated_solutions_questions ON ai_generated_solutions USING GIN (questions_asked);
CREATE INDEX IF NOT EXISTS idx_ai_generated_solutions_answers ON ai_generated_solutions USING GIN (user_answers);