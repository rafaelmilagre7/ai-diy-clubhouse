import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GlossaryCategory, GlossaryTermWithCategory } from "@/types/glossaryTypes";

export const useGlossaryCategories = () => {
  return useQuery({
    queryKey: ['glossary-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('glossary_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as GlossaryCategory[];
    },
  });
};

export const useGlossaryTerms = (categorySlug?: string, searchTerm?: string) => {
  return useQuery({
    queryKey: ['glossary-terms', categorySlug, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('glossary_terms_with_category')
        .select('*');

      if (categorySlug) {
        query = query.eq('category_slug', categorySlug);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,short_definition.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
      }

      const { data, error } = await query.order('title', { ascending: true });
      
      if (error) throw error;
      return data as GlossaryTermWithCategory[];
    },
  });
};

export const useGlossaryTerm = (slug: string) => {
  return useQuery({
    queryKey: ['glossary-term', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('glossary_terms_with_category')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      
      // Increment view count
      await supabase.rpc('increment_glossary_views', { term_id: data.id });
      
      return data as GlossaryTermWithCategory;
    },
  });
};

export const useFeaturedTerms = () => {
  return useQuery({
    queryKey: ['featured-terms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('glossary_terms_with_category')
        .select('*')
        .eq('is_featured', true)
        .order('view_count', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data as GlossaryTermWithCategory[];
    },
  });
};

export const useRelatedTerms = (termId: string) => {
  return useQuery({
    queryKey: ['related-terms', termId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('glossary_term_relations')
        .select(`
          *,
          related_term:glossary_terms!related_term_id (
            id,
            title,
            slug,
            short_definition,
            difficulty_level
          )
        `)
        .eq('term_id', termId);
      
      if (error) throw error;
      return data;
    },
  });
};