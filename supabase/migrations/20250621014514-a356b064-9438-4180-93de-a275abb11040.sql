
-- Tornar lesson_id nullable na tabela learning_resources para permitir recursos globais
ALTER TABLE learning_resources ALTER COLUMN lesson_id DROP NOT NULL;

-- Adicionar comentário para documentar o propósito
COMMENT ON COLUMN learning_resources.lesson_id IS 'ID da aula específica. NULL para recursos da biblioteca global';
