import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { WikiCategory, WikiArticleWithCategory } from "@/types/wikiTypes";

export const useWikiCategories = () => {
  return useQuery({
    queryKey: ['wiki-categories'],
    queryFn: async (): Promise<WikiCategory[]> => {
      const { data, error } = await supabase
        .from('wiki_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useWikiArticles = (categorySlug?: string, searchQuery?: string) => {
  return useQuery({
    queryKey: ['wiki-articles', categorySlug, searchQuery],
    queryFn: async (): Promise<WikiArticleWithCategory[]> => {
      let query = supabase
        .from('wiki_articles_with_category')
        .select('*')
        .eq('is_published', true);

      if (categorySlug) {
        query = query.eq('category_slug', categorySlug);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`);
      }

      const { data, error } = await query
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useWikiArticle = (slug: string) => {
  return useQuery({
    queryKey: ['wiki-article', slug],
    queryFn: async (): Promise<WikiArticleWithCategory | null> => {
      const { data, error } = await supabase
        .from('wiki_articles_with_category')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      // Incrementar visualizações
      if (data?.id) {
        await supabase.rpc('increment_wiki_views', { article_id: data.id });
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useFeaturedWikiArticles = () => {
  return useQuery({
    queryKey: ['featured-wiki-articles'],
    queryFn: async (): Promise<WikiArticleWithCategory[]> => {
      const { data, error } = await supabase
        .from('wiki_articles_with_category')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('view_count', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useRelatedWikiArticles = (articleId: string) => {
  return useQuery({
    queryKey: ['related-wiki-articles', articleId],
    queryFn: async (): Promise<WikiArticleWithCategory[]> => {
      const { data, error } = await supabase
        .from('wiki_article_relations')
        .select(`
          related_article_id,
          relation_type,
          related_article:wiki_articles_with_category!wiki_article_relations_related_article_id_fkey(*)
        `)
        .eq('article_id', articleId)
        .limit(5);
      
      if (error) throw error;
      
      return data?.map((relation: any) => relation.related_article).filter(Boolean) || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};