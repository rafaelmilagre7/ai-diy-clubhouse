
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { NewTopicForm } from '@/components/community/NewTopicForm';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const CreateTopic = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  
  // Buscar o ID da categoria com base no slug
  const { data: category, isLoading } = useQuery({
    queryKey: ['forumCategory', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return null;
      
      const { data, error } = await supabase
        .from('forum_categories')
        .select('id, name, slug')
        .eq('slug', categorySlug)
        .single();
      
      if (error) throw error;
      return data;
    },
    meta: {
      onError: (error: any) => {
        toast.error("Categoria não encontrada");
        navigate('/comunidade/forum', { replace: true });
      }
    }
  });
  
  const handleCancel = () => {
    navigate(categorySlug 
      ? `/comunidade/categoria/${categorySlug}`
      : '/comunidade/forum'
    );
  };
  
  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        section="novo-topico"
        sectionTitle="Novo Tópico"
        categoryName={category?.name}
        categorySlug={categorySlug}
      />
      
      <div className="mt-6">
        <h1 className="text-3xl font-bold">Criar Novo Tópico</h1>
        <p className="text-muted-foreground mt-2 mb-6">
          Compartilhe suas dúvidas, insights ou discussões com a comunidade
        </p>
        
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-neutral-800 rounded mb-4"></div>
            <div className="h-40 bg-neutral-800 rounded"></div>
          </div>
        ) : (
          category && (
            <NewTopicForm 
              categoryId={category.id} 
              categorySlug={categorySlug || ''}
              onCancel={handleCancel}
            />
          )
        )}
      </div>
    </div>
  );
};

export default CreateTopic;
