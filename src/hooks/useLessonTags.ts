import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LessonTag, LearningLessonTag } from '@/lib/supabase/types/learning';
import { useToastModern } from '@/hooks/useToastModern';

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

// Hook para buscar todas as tags (incluindo inativas) para gestão admin
export const useAllLessonTags = () => {
  return useQuery({
    queryKey: ['lesson-tags-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_tags')
        .select('*')
        .order('category', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as LessonTag[];
    }
  });
};

// Hook para buscar tags por categoria (filtra categorias não desejadas)
export const useLessonTagsByCategory = () => {
  const { data: tags = [], ...rest } = useLessonTags();
  
  // Filtrar tags removendo as categorias 'ferramenta' e 'nivel' 
  // que já existem em outros campos da aula
  const filteredTags = tags.filter(tag => 
    tag.category !== 'ferramenta' && tag.category !== 'nivel'
  );
  
  const tagsByCategory = filteredTags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, LessonTag[]>);

  return { tagsByCategory, tags: filteredTags, ...rest };
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
  const { showSuccess, showError } = useToastModern();

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
      showSuccess("Tag adicionada", "Tag foi adicionada à aula com sucesso.");
    },
    onError: (error) => {
      showError("Erro ao adicionar tag", error.message);
    }
  });
};

// Hook para remover tag de uma lição
export const useRemoveTagFromLesson = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastModern();

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
      showSuccess("Tag removida", "Tag foi removida da aula com sucesso.");
    },
    onError: (error) => {
      showError("Erro ao remover tag", error.message);
    }
  });
};

// Hook para criar nova tag (admin)
export const useCreateTag = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastModern();

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
      queryClient.invalidateQueries({ queryKey: ['lesson-tags-all'] });
      showSuccess("Tag criada", "Nova tag foi criada com sucesso.");
    },
    onError: (error) => {
      showError("Erro ao criar tag", error.message);
    }
  });
};

// Hook para editar tag (admin)
export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastModern();

  return useMutation({
    mutationFn: async ({ id, tagData }: { id: string; tagData: Partial<LessonTag> }) => {
      const { data, error } = await supabase
        .from('lesson_tags')
        .update({ ...tagData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as LessonTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-tags'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-tags-all'] });
      showSuccess("Tag atualizada", "Tag foi atualizada com sucesso.");
    },
    onError: (error) => {
      showError("Erro ao atualizar tag", error.message);
    }
  });
};

// Hook para deletar tag (admin)
export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastModern();

  return useMutation({
    mutationFn: async (tagId: string) => {
      // Primeiro, remover todas as associações da tag com as aulas
      const { error: associationError } = await supabase
        .from('learning_lesson_tags')
        .delete()
        .eq('tag_id', tagId);

      if (associationError) throw associationError;

      // Depois, deletar a tag
      const { error } = await supabase
        .from('lesson_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-tags'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-tags-all'] });
      showSuccess("Tag deletada", "Tag foi deletada com sucesso.");
    },
    onError: (error) => {
      showError("Erro ao deletar tag", error.message);
    }
  });
};