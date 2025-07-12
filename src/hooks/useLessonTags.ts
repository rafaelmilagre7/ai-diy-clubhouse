import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LessonTag, LearningLessonTag } from '@/lib/supabase/types/learning';
import { toast } from '@/hooks/use-toast';

// Hook para buscar todas as tags
export const useLessonTags = () => {
  return useQuery({
    queryKey: ['lesson-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_tags')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as LessonTag[];
    }
  });
};

// Hook para buscar tags por categoria
export const useLessonTagsByCategory = () => {
  const { data: tags = [], ...rest } = useLessonTags();
  
  const tagsByCategory = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, LessonTag[]>);

  return { tagsByCategory, tags, ...rest };
};

// Hook para buscar tags de uma lição específica
export const useLessonTagsForLesson = (lessonId: string) => {
  return useQuery({
    queryKey: ['lesson-tags', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_lesson_tags')
        .select(`
          *,
          lesson_tags (*)
        `)
        .eq('lesson_id', lessonId);

      if (error) throw error;
      return data as (LearningLessonTag & { lesson_tags: LessonTag })[];
    },
    enabled: !!lessonId
  });
};

// Hook para adicionar tag a uma lição
export const useAddTagToLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, tagId }: { lessonId: string; tagId: string }) => {
      const { data, error } = await supabase
        .from('learning_lesson_tags')
        .insert({ lesson_id: lessonId, tag_id: tagId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-tags', variables.lessonId] });
      toast({
        title: "Tag adicionada",
        description: "Tag foi adicionada à aula com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar tag",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook para remover tag de uma lição
export const useRemoveTagFromLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, tagId }: { lessonId: string; tagId: string }) => {
      const { error } = await supabase
        .from('learning_lesson_tags')
        .delete()
        .eq('lesson_id', lessonId)
        .eq('tag_id', tagId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-tags', variables.lessonId] });
      toast({
        title: "Tag removida",
        description: "Tag foi removida da aula com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover tag",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Hook para criar nova tag (admin)
export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagData: Partial<LessonTag>) => {
      const { data, error } = await supabase
        .from('lesson_tags')
        .insert(tagData)
        .select()
        .single();

      if (error) throw error;
      return data as LessonTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-tags'] });
      toast({
        title: "Tag criada",
        description: "Nova tag foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar tag",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};