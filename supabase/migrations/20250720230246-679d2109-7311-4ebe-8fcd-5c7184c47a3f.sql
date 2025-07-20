-- MIGRAÇÃO COMPLETA: Forum -> Community
-- Renomear todas as tabelas e atualizar estrutura

-- 1. Renomear tabelas principais
ALTER TABLE forum_categories RENAME TO community_categories;
ALTER TABLE forum_topics RENAME TO community_topics;
ALTER TABLE forum_posts RENAME TO community_posts;
ALTER TABLE forum_reactions RENAME TO community_reactions;

-- 2. Atualizar foreign keys
ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS forum_posts_topic_id_fkey;
ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS forum_posts_user_id_fkey;
ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS forum_posts_parent_id_fkey;

ALTER TABLE community_posts 
ADD CONSTRAINT community_posts_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES community_topics(id) ON DELETE CASCADE;

ALTER TABLE community_posts 
ADD CONSTRAINT community_posts_parent_id_fkey 
FOREIGN KEY (parent_id) REFERENCES community_posts(id) ON DELETE CASCADE;

ALTER TABLE community_topics DROP CONSTRAINT IF EXISTS forum_topics_category_id_fkey;
ALTER TABLE community_topics DROP CONSTRAINT IF EXISTS forum_topics_user_id_fkey;

ALTER TABLE community_topics 
ADD CONSTRAINT community_topics_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES community_categories(id) ON DELETE SET NULL;

ALTER TABLE community_reactions DROP CONSTRAINT IF EXISTS forum_reactions_post_id_fkey;
ALTER TABLE community_reactions DROP CONSTRAINT IF EXISTS forum_reactions_user_id_fkey;

ALTER TABLE community_reactions 
ADD CONSTRAINT community_reactions_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE;

-- 3. Atualizar triggers
DROP TRIGGER IF EXISTS update_forum_topics_updated_at ON community_topics;
CREATE TRIGGER update_community_topics_updated_at
    BEFORE UPDATE ON community_topics
    FOR EACH ROW
    EXECUTE FUNCTION update_learning_updated_at();

DROP TRIGGER IF EXISTS update_forum_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at
    BEFORE UPDATE ON community_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_learning_updated_at();

-- 4. Criar funções RPC para community
CREATE OR REPLACE FUNCTION public.delete_community_topic(topic_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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
SET search_path TO ''
AS $$
BEGIN
  -- Verificar permissões (admin ou autor)
  IF NOT (public.is_user_admin(auth.uid()) OR EXISTS(
    SELECT 1 FROM public.community_posts WHERE id = post_id AND user_id = auth.uid()
  )) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permission denied');
  END IF;
  
  -- Deletar post
  DELETE FROM public.community_posts WHERE id = post_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Post deleted successfully');
END;
$$;

-- 5. Atualizar funções de incremento
CREATE OR REPLACE FUNCTION public.increment_topic_views(topic_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  UPDATE public.community_topics
  SET view_count = COALESCE(view_count, 0) + 1,
      last_activity_at = now()
  WHERE id = topic_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_topic_replies(topic_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  UPDATE public.community_topics
  SET reply_count = COALESCE(reply_count, 0) + 1,
      last_activity_at = now()
  WHERE id = topic_id;
END;
$$;

-- 6. Configurar realtime para as novas tabelas
ALTER TABLE community_categories REPLICA IDENTITY FULL;
ALTER TABLE community_topics REPLICA IDENTITY FULL;
ALTER TABLE community_posts REPLICA IDENTITY FULL;
ALTER TABLE community_reactions REPLICA IDENTITY FULL;

-- 7. Log da migração completa
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'migration',
  'forum_to_community_complete',
  jsonb_build_object(
    'message', 'Migração completa Forum -> Community executada',
    'tables_renamed', '["forum_categories->community_categories", "forum_topics->community_topics", "forum_posts->community_posts", "forum_reactions->community_reactions"]',
    'functions_created', '["delete_community_topic", "delete_community_post"]',
    'realtime_enabled', true,
    'status', 'SUCCESS'
  ),
  auth.uid()
);