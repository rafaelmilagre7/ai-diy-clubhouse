-- Função para logar tentativas de INSERT em community_posts
CREATE OR REPLACE FUNCTION public.log_comment_attempt()
RETURNS TRIGGER AS $$
BEGIN
  RAISE LOG 'Tentativa INSERT community_posts: user_id=%, topic_id=%, auth.uid()=%, auth.jwt()=%', 
    NEW.user_id, NEW.topic_id, auth.uid(), 
    CASE WHEN auth.uid() IS NOT NULL THEN 'presente' ELSE 'ausente' END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para logar todas as tentativas de INSERT
DROP TRIGGER IF EXISTS log_community_posts_insert ON public.community_posts;
CREATE TRIGGER log_community_posts_insert
BEFORE INSERT ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.log_comment_attempt();