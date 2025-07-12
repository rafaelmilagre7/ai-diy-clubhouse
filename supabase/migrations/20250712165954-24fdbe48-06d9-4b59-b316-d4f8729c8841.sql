-- Criar tabela suggestion_votes para sistema de votação
CREATE TABLE public.suggestion_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion_id UUID NOT NULL REFERENCES public.suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_suggestion_votes_suggestion_id ON public.suggestion_votes(suggestion_id);
CREATE INDEX idx_suggestion_votes_user_id ON public.suggestion_votes(user_id);

-- Constraint para evitar voto duplo do mesmo usuário na mesma sugestão
ALTER TABLE public.suggestion_votes ADD CONSTRAINT unique_user_suggestion_vote 
UNIQUE (suggestion_id, user_id);

-- Habilitar RLS
ALTER TABLE public.suggestion_votes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage their own suggestion votes"
ON public.suggestion_votes
FOR ALL
USING (auth.uid() = user_id::uuid);

CREATE POLICY "Anyone can view suggestion votes"
ON public.suggestion_votes
FOR SELECT
USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_suggestion_votes_updated_at
BEFORE UPDATE ON public.suggestion_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para atualizar contadores de votos nas sugestões
CREATE OR REPLACE FUNCTION public.update_suggestion_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contadores na tabela suggestions
  UPDATE public.suggestions
  SET 
    upvotes = (
      SELECT COUNT(*) 
      FROM public.suggestion_votes 
      WHERE suggestion_id = COALESCE(NEW.suggestion_id, OLD.suggestion_id) 
      AND vote_type = 'upvote'
    ),
    downvotes = (
      SELECT COUNT(*) 
      FROM public.suggestion_votes 
      WHERE suggestion_id = COALESCE(NEW.suggestion_id, OLD.suggestion_id) 
      AND vote_type = 'downvote'
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.suggestion_id, OLD.suggestion_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para manter contadores sincronizados
CREATE TRIGGER suggestion_vote_insert_trigger
AFTER INSERT ON public.suggestion_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_suggestion_vote_counts();

CREATE TRIGGER suggestion_vote_update_trigger
AFTER UPDATE ON public.suggestion_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_suggestion_vote_counts();

CREATE TRIGGER suggestion_vote_delete_trigger
AFTER DELETE ON public.suggestion_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_suggestion_vote_counts();