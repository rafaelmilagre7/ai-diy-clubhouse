-- Criar tabela forum_reactions para sistema de reações nos posts do fórum
CREATE TABLE public.forum_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'dislike', 'helpful', 'funny')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_forum_reactions_post_id ON public.forum_reactions(post_id);
CREATE INDEX idx_forum_reactions_user_id ON public.forum_reactions(user_id);

-- Constraint para evitar reação dupla do mesmo usuário no mesmo post
ALTER TABLE public.forum_reactions ADD CONSTRAINT unique_user_post_reaction 
UNIQUE (post_id, user_id);

-- Habilitar RLS
ALTER TABLE public.forum_reactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage their own forum reactions"
ON public.forum_reactions
FOR ALL
USING (auth.uid() = user_id::uuid);

CREATE POLICY "Anyone can view forum reactions"
ON public.forum_reactions
FOR SELECT
USING (true);

-- Função para atualizar contadores de reações nos posts
CREATE OR REPLACE FUNCTION public.update_forum_post_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contador na tabela forum_posts se ela tiver essas colunas
  -- Como não vi reaction_count na estrutura original, vou apenas documentar
  -- UPDATE public.forum_posts
  -- SET reaction_count = (
  --   SELECT COUNT(*) 
  --   FROM public.forum_reactions 
  --   WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
  -- )
  -- WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para manter contadores sincronizados (comentados por enquanto)
-- CREATE TRIGGER forum_reaction_insert_trigger
-- AFTER INSERT ON public.forum_reactions
-- FOR EACH ROW
-- EXECUTE FUNCTION public.update_forum_post_reaction_counts();

-- CREATE TRIGGER forum_reaction_delete_trigger
-- AFTER DELETE ON public.forum_reactions
-- FOR EACH ROW
-- EXECUTE FUNCTION public.update_forum_post_reaction_counts();