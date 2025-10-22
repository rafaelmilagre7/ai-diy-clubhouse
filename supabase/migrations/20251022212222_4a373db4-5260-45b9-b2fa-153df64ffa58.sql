-- 1. Adicionar coluna likes_count
ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- 2. Popular com dados existentes
UPDATE community_posts 
SET likes_count = (
  SELECT COUNT(*) 
  FROM community_reactions 
  WHERE community_reactions.post_id = community_posts.id 
  AND community_reactions.reaction_type = 'like'
);

-- 3. Criar função para atualizar contador
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.reaction_type = 'like' THEN
    UPDATE community_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.reaction_type = 'like' THEN
    UPDATE community_posts 
    SET likes_count = GREATEST(0, likes_count - 1) 
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar trigger
DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON community_reactions;
CREATE TRIGGER trigger_update_post_likes_count
AFTER INSERT OR DELETE ON community_reactions
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count();