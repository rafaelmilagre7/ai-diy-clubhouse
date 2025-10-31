-- ============================================
-- ETAPA 1: Limpar dados órfãos
-- ============================================

-- Verificar e deletar tópicos órfãos (sem user_id válido)
DELETE FROM community_topics 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- Verificar e deletar posts órfãos (sem user_id válido)
DELETE FROM community_posts
WHERE user_id NOT IN (SELECT id FROM profiles);

-- Verificar e deletar posts órfãos (sem topic_id válido)
DELETE FROM community_posts
WHERE topic_id NOT IN (SELECT id FROM community_topics);

-- ============================================
-- ETAPA 2: Criar Foreign Keys corretamente
-- ============================================

-- Dropar constraints antigos se existirem
ALTER TABLE community_topics 
DROP CONSTRAINT IF EXISTS community_topics_user_id_fkey CASCADE;

ALTER TABLE community_topics 
DROP CONSTRAINT IF EXISTS community_topics_category_id_fkey CASCADE;

ALTER TABLE community_posts 
DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey CASCADE;

ALTER TABLE community_posts 
DROP CONSTRAINT IF EXISTS community_posts_topic_id_fkey CASCADE;

-- Criar foreign keys para community_topics
ALTER TABLE community_topics
ADD CONSTRAINT community_topics_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id)
ON DELETE CASCADE;

ALTER TABLE community_topics
ADD CONSTRAINT community_topics_category_id_fkey
FOREIGN KEY (category_id) REFERENCES community_categories(id)
ON DELETE SET NULL;

-- Criar foreign keys para community_posts
ALTER TABLE community_posts
ADD CONSTRAINT community_posts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id)
ON DELETE CASCADE;

ALTER TABLE community_posts
ADD CONSTRAINT community_posts_topic_id_fkey
FOREIGN KEY (topic_id) REFERENCES community_topics(id)
ON DELETE CASCADE;