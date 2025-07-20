
-- Adicionar foreign keys faltantes para community_topics
ALTER TABLE public.community_topics 
ADD CONSTRAINT community_topics_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Verificar se a foreign key para community_categories já existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'community_topics_category_id_fkey' 
        AND table_name = 'community_topics'
    ) THEN
        ALTER TABLE public.community_topics 
        ADD CONSTRAINT community_topics_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES public.community_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Adicionar foreign key faltante para community_posts se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'community_posts_user_id_fkey' 
        AND table_name = 'community_posts'
    ) THEN
        ALTER TABLE public.community_posts 
        ADD CONSTRAINT community_posts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Verificar e corrigir as foreign keys de community_reactions se necessário
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'community_reactions_user_id_fkey' 
        AND table_name = 'community_reactions'
    ) THEN
        ALTER TABLE public.community_reactions 
        ADD CONSTRAINT community_reactions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;
