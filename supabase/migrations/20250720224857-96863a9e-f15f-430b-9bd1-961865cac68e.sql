
-- FASE 1: Renomear tabelas do fórum para comunidade
-- Esta migração é crítica para padronização completa

-- 1. Renomear tabelas principais
ALTER TABLE public.forum_categories RENAME TO community_categories;
ALTER TABLE public.forum_topics RENAME TO community_topics;
ALTER TABLE public.forum_posts RENAME TO community_posts;
ALTER TABLE public.forum_reactions RENAME TO community_reactions;

-- 2. Atualizar índices (renomear automaticamente com as tabelas)
-- 3. Atualizar constraints de foreign key

-- Atualizar foreign keys em community_topics
ALTER TABLE public.community_topics 
DROP CONSTRAINT IF EXISTS forum_topics_category_id_fkey;

ALTER TABLE public.community_topics 
ADD CONSTRAINT community_topics_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.community_categories(id);

-- Atualizar foreign keys em community_posts
ALTER TABLE public.community_posts 
DROP CONSTRAINT IF EXISTS forum_posts_topic_id_fkey;

ALTER TABLE public.community_posts 
ADD CONSTRAINT community_posts_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES public.community_topics(id);

ALTER TABLE public.community_posts 
DROP CONSTRAINT IF EXISTS forum_posts_parent_id_fkey;

ALTER TABLE public.community_posts 
ADD CONSTRAINT community_posts_parent_id_fkey 
FOREIGN KEY (parent_id) REFERENCES public.community_posts(id);

-- Atualizar foreign keys em community_reactions
ALTER TABLE public.community_reactions 
DROP CONSTRAINT IF EXISTS forum_reactions_post_id_fkey;

ALTER TABLE public.community_reactions 
ADD CONSTRAINT community_reactions_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES public.community_posts(id);

-- 4. Atualizar triggers existentes
DROP TRIGGER IF EXISTS update_forum_topic_activity ON public.community_posts;

CREATE TRIGGER update_community_topic_activity
AFTER INSERT ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION update_forum_last_activity();

-- 5. Criar novas funções RPC padronizadas
CREATE OR REPLACE FUNCTION public.delete_community_topic(topic_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar permissões (admin ou autor)
  IF NOT (public.is_user_admin(auth.uid()) OR EXISTS(
    SELECT 1 FROM public.community_topics WHERE id = topic_id AND user_id = auth.uid()
  )) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permission denied');
  END IF;
  
  -- Deletar posts relacionados primeiro
  DELETE FROM public.community_posts WHERE topic_id = topic_id;
  
  -- Deletar tópico
  DELETE FROM public.community_topics WHERE id = topic_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Topic deleted successfully');
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_community_post(post_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  post_data record;
BEGIN
  -- Verificar permissões (admin ou autor)
  IF NOT (public.is_user_admin(auth.uid()) OR EXISTS(
    SELECT 1 FROM public.community_posts WHERE id = post_id AND user_id = auth.uid()
  )) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permission denied');
  END IF;
  
  -- Buscar dados do post antes de deletar
  SELECT topic_id, is_solution INTO post_data
  FROM public.community_posts 
  WHERE id = post_id;
  
  -- Deletar post
  DELETE FROM public.community_posts WHERE id = post_id;
  
  -- Se era uma solução aceita, desmarcar o tópico como resolvido
  IF post_data.is_solution THEN
    UPDATE public.community_topics 
    SET is_solved = false 
    WHERE id = post_data.topic_id;
  END IF;
  
  -- Decrementar contagem de respostas
  UPDATE public.community_topics 
  SET reply_count = GREATEST(reply_count - 1, 0),
      last_activity_at = now()
  WHERE id = post_data.topic_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Post deleted successfully');
END;
$$;

-- 6. Manter aliases para compatibilidade temporária
CREATE OR REPLACE FUNCTION public.deleteforumtopic(topic_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.delete_community_topic(topic_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.deleteforumpost(post_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.delete_community_post(post_id);
END;
$$;

-- 7. Atualizar realtime subscriptions
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.forum_categories;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.forum_topics;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.forum_posts;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.forum_reactions;

ALTER PUBLICATION supabase_realtime ADD TABLE public.community_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_topics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_reactions;
