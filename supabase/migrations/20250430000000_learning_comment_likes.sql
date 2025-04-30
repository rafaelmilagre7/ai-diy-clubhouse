
-- Criar tabela para curtidas de comentários no LMS
CREATE TABLE IF NOT EXISTS public.learning_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES learning_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, comment_id)
);

-- Garantir que a coluna likes_count existe na tabela learning_comments
ALTER TABLE learning_comments
  ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0;

-- Adicionar RLS (Row Level Security) para curtidas
ALTER TABLE public.learning_comment_likes ENABLE ROW LEVEL SECURITY;

-- Políticas para curtidas
CREATE POLICY "Qualquer pessoa pode ver curtidas" ON public.learning_comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem curtir" ON public.learning_comment_likes
  FOR INSERT TO authenticated USING (true) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover suas próprias curtidas" ON public.learning_comment_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Configurar realtime para comentários e curtidas
ALTER TABLE learning_comments REPLICA IDENTITY FULL;
ALTER TABLE learning_comment_likes REPLICA IDENTITY FULL;
