-- ============================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- (Foreign keys já existem)
-- ============================================

-- Índices para community_topics
CREATE INDEX IF NOT EXISTS idx_community_topics_user_id 
ON community_topics(user_id);

CREATE INDEX IF NOT EXISTS idx_community_topics_category_id 
ON community_topics(category_id);

-- Índices para community_posts
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id 
ON community_posts(user_id);

CREATE INDEX IF NOT EXISTS idx_community_posts_topic_id 
ON community_posts(topic_id);