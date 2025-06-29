
-- ===============================================================
-- RESTAURAÇÃO CORRIGIDA DAS TABELAS: forum_categories, forum_topics, forum_posts, suggestions
-- (VERSÃO CORRIGIDA - REMOVE TRIGGERS EXISTENTES)
-- ===============================================================

-- 1. CRIAR TABELA forum_categories (necessária para as referências)
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  topic_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. CRIAR TABELA suggestion_categories (necessária para as referências)
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.suggestion_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. INSERIR CATEGORIAS PADRÃO
-- ===============================================================
INSERT INTO public.forum_categories (name, slug, description, color, icon, order_index) VALUES
  ('Geral', 'geral', 'Discussões gerais da comunidade', '#6366f1', '💬', 1),
  ('Suporte', 'suporte', 'Perguntas e suporte técnico', '#dc2626', '🆘', 2),
  ('Implementação', 'implementacao', 'Discussões sobre implementação de soluções', '#059669', '⚙️', 3),
  ('Feedback', 'feedback', 'Feedback e melhorias', '#7c3aed', '💡', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.suggestion_categories (name, description) VALUES
  ('Funcionalidade', 'Novas funcionalidades para a plataforma'),
  ('Melhoria', 'Melhorias em funcionalidades existentes'),
  ('Bug Report', 'Relatórios de bugs e problemas')
ON CONFLICT DO NOTHING;

-- 4. CRIAR TABELA forum_topics
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.forum_categories(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_solved BOOLEAN DEFAULT false,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. CREAR TABELA forum_posts
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  is_solution BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. CRIAR TABELA suggestions
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.suggestion_categories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'in_development', 'implemented', 'rejected')),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. MIGRAR DADOS DOS BACKUPS (CORRIGIDO - SEM REFERÊNCIAS INVÁLIDAS)
-- ===============================================================

-- Migrar forum_topics (sempre usar categoria padrão "Geral")
INSERT INTO public.forum_topics (
  id, title, content, user_id, category_id, view_count, reply_count,
  is_pinned, is_locked, is_solved, last_activity_at, created_at, updated_at
)
SELECT 
  b.id, b.title, b.content, b.user_id, 
  (SELECT id FROM public.forum_categories WHERE slug = 'geral' LIMIT 1),
  COALESCE(b.view_count, 0), COALESCE(b.reply_count, 0),
  COALESCE(b.is_pinned, false), COALESCE(b.is_locked, false), COALESCE(b.is_solved, false),
  COALESCE(b.last_activity_at, b.created_at), b.created_at, b.updated_at
FROM public.cleanup_backup_forum_topics b
WHERE b.id IS NOT NULL AND b.title IS NOT NULL AND b.content IS NOT NULL AND b.user_id IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  view_count = EXCLUDED.view_count,
  reply_count = EXCLUDED.reply_count,
  is_pinned = EXCLUDED.is_pinned,
  is_locked = EXCLUDED.is_locked,
  is_solved = EXCLUDED.is_solved,
  last_activity_at = EXCLUDED.last_activity_at,
  updated_at = now();

-- Migrar forum_posts
INSERT INTO public.forum_posts (
  id, topic_id, content, user_id, parent_id, is_solution, is_hidden, created_at, updated_at
)
SELECT 
  b.id, b.topic_id, b.content, b.user_id, b.parent_id,
  COALESCE(b.is_solution, false), COALESCE(b.is_hidden, false),
  b.created_at, b.updated_at
FROM public.cleanup_backup_forum_posts b
WHERE b.id IS NOT NULL AND b.topic_id IS NOT NULL AND b.content IS NOT NULL AND b.user_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.forum_topics WHERE id = b.topic_id)
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  is_solution = EXCLUDED.is_solution,
  is_hidden = EXCLUDED.is_hidden,
  updated_at = now();

-- Migrar suggestions (sempre usar categoria padrão "Funcionalidade")
INSERT INTO public.suggestions (
  id, title, description, user_id, category_id, status, upvotes, downvotes,
  comment_count, is_pinned, is_hidden, image_url, created_at, updated_at
)
SELECT 
  b.id, b.title, b.description, b.user_id, 
  (SELECT id FROM public.suggestion_categories WHERE name = 'Funcionalidade' LIMIT 1),
  COALESCE(b.status::text, 'new'), COALESCE(b.upvotes, 0), COALESCE(b.downvotes, 0),
  COALESCE(b.comment_count, 0), COALESCE(b.is_pinned, false), COALESCE(b.is_hidden, false),
  b.image_url, b.created_at, b.updated_at
FROM public.cleanup_backup_suggestions b
WHERE b.id IS NOT NULL AND b.title IS NOT NULL AND b.description IS NOT NULL AND b.user_id IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  upvotes = EXCLUDED.upvotes,
  downvotes = EXCLUDED.downvotes,
  comment_count = EXCLUDED.comment_count,
  is_pinned = EXCLUDED.is_pinned,
  is_hidden = EXCLUDED.is_hidden,
  updated_at = now();

-- 8. CONFIGURAR RLS (ROW LEVEL SECURITY)
-- ===============================================================

-- RLS para forum_categories
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "forum_categories_select_policy" ON public.forum_categories;
DROP POLICY IF EXISTS "forum_categories_admin_policy" ON public.forum_categories;
CREATE POLICY "forum_categories_select_policy" ON public.forum_categories FOR SELECT USING (true);
CREATE POLICY "forum_categories_admin_policy" ON public.forum_categories FOR ALL USING (public.is_user_admin(auth.uid()));

-- RLS para suggestion_categories
ALTER TABLE public.suggestion_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "suggestion_categories_select_policy" ON public.suggestion_categories;
DROP POLICY IF EXISTS "suggestion_categories_admin_policy" ON public.suggestion_categories;
CREATE POLICY "suggestion_categories_select_policy" ON public.suggestion_categories FOR SELECT USING (true);
CREATE POLICY "suggestion_categories_admin_policy" ON public.suggestion_categories FOR ALL USING (public.is_user_admin(auth.uid()));

-- RLS para forum_topics
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "forum_topics_select_policy" ON public.forum_topics;
DROP POLICY IF EXISTS "forum_topics_insert_policy" ON public.forum_topics;
DROP POLICY IF EXISTS "forum_topics_update_policy" ON public.forum_topics;
DROP POLICY IF EXISTS "forum_topics_delete_policy" ON public.forum_topics;
CREATE POLICY "forum_topics_select_policy" ON public.forum_topics FOR SELECT USING (true);
CREATE POLICY "forum_topics_insert_policy" ON public.forum_topics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "forum_topics_update_policy" ON public.forum_topics FOR UPDATE USING (user_id = auth.uid() OR public.is_user_admin(auth.uid()));
CREATE POLICY "forum_topics_delete_policy" ON public.forum_topics FOR DELETE USING (user_id = auth.uid() OR public.is_user_admin(auth.uid()));

-- RLS para forum_posts
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "forum_posts_select_policy" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_insert_policy" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_update_policy" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_delete_policy" ON public.forum_posts;
CREATE POLICY "forum_posts_select_policy" ON public.forum_posts FOR SELECT USING (NOT is_hidden OR user_id = auth.uid() OR public.is_user_admin(auth.uid()));
CREATE POLICY "forum_posts_insert_policy" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "forum_posts_update_policy" ON public.forum_posts FOR UPDATE USING (user_id = auth.uid() OR public.is_user_admin(auth.uid()));
CREATE POLICY "forum_posts_delete_policy" ON public.forum_posts FOR DELETE USING (user_id = auth.uid() OR public.is_user_admin(auth.uid()));

-- RLS para suggestions
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "suggestions_select_policy" ON public.suggestions;
DROP POLICY IF EXISTS "suggestions_insert_policy" ON public.suggestions;
DROP POLICY IF EXISTS "suggestions_update_policy" ON public.suggestions;
DROP POLICY IF EXISTS "suggestions_delete_policy" ON public.suggestions;
CREATE POLICY "suggestions_select_policy" ON public.suggestions FOR SELECT USING (NOT is_hidden OR user_id = auth.uid() OR public.is_user_admin(auth.uid()));
CREATE POLICY "suggestions_insert_policy" ON public.suggestions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "suggestions_update_policy" ON public.suggestions FOR UPDATE USING (user_id = auth.uid() OR public.is_user_admin(auth.uid()));
CREATE POLICY "suggestions_delete_policy" ON public.suggestions FOR DELETE USING (user_id = auth.uid() OR public.is_user_admin(auth.uid()));

-- 9. CRIAR ÍNDICES PARA PERFORMANCE
-- ===============================================================

-- Índices para forum_topics
CREATE INDEX IF NOT EXISTS idx_forum_topics_user_id ON public.forum_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id ON public.forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_last_activity ON public.forum_topics(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at ON public.forum_topics(created_at DESC);

-- Índices para forum_posts
CREATE INDEX IF NOT EXISTS idx_forum_posts_topic_id ON public.forum_posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON public.forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent_id ON public.forum_posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON public.forum_posts(created_at DESC);

-- Índices para suggestions
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON public.suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_category_id ON public.suggestions(category_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON public.suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON public.suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_upvotes ON public.suggestions(upvotes DESC);

-- 10. TRIGGERS PARA ATUALIZAR TIMESTAMPS (REMOVE EXISTENTES PRIMEIRO)
-- ===============================================================

-- Remove triggers existentes
DROP TRIGGER IF EXISTS update_forum_categories_updated_at ON public.forum_categories;
DROP TRIGGER IF EXISTS update_suggestion_categories_updated_at ON public.suggestion_categories;
DROP TRIGGER IF EXISTS update_forum_topics_updated_at ON public.forum_topics;
DROP TRIGGER IF EXISTS update_forum_posts_updated_at ON public.forum_posts;
DROP TRIGGER IF EXISTS update_suggestions_updated_at ON public.suggestions;

-- Cria triggers novamente
CREATE TRIGGER update_forum_categories_updated_at 
    BEFORE UPDATE ON public.forum_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suggestion_categories_updated_at 
    BEFORE UPDATE ON public.suggestion_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_topics_updated_at 
    BEFORE UPDATE ON public.forum_topics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at 
    BEFORE UPDATE ON public.forum_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suggestions_updated_at 
    BEFORE UPDATE ON public.suggestions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. VERIFICAÇÃO FINAL
-- ===============================================================
SELECT 
  'forum_categories' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE is_active = true) as active_count,
  0 as other_count
FROM public.forum_categories
UNION ALL
SELECT 
  'suggestion_categories' as table_name,
  COUNT(*) as total_records,
  0 as active_count,
  0 as other_count
FROM public.suggestion_categories
UNION ALL
SELECT 
  'forum_topics' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE is_pinned = true) as pinned_count,
  COUNT(*) FILTER (WHERE is_solved = true) as solved_count
FROM public.forum_topics
UNION ALL
SELECT 
  'forum_posts' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE is_solution = true) as solution_count,
  COUNT(*) FILTER (WHERE parent_id IS NOT NULL) as reply_count
FROM public.forum_posts
UNION ALL
SELECT 
  'suggestions' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE status = 'implemented') as implemented_count,
  COUNT(*) FILTER (WHERE is_pinned = true) as pinned_count
FROM public.suggestions;
