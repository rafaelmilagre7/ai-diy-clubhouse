
-- Adiciona o campo video_progress à tabela learning_progress
ALTER TABLE public.learning_progress 
ADD COLUMN IF NOT EXISTS video_progress JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.learning_progress.video_progress IS 'Armazena o progresso individual de cada vídeo da aula no formato {video_id: percentage}';
