-- Adicionar coluna blocked na tabela learning_modules
ALTER TABLE public.learning_modules 
ADD COLUMN blocked boolean NOT NULL DEFAULT false;

-- Comentário explicativo
COMMENT ON COLUMN public.learning_modules.blocked IS 'Indica se o módulo está bloqueado para os usuários (não liberado ainda)';