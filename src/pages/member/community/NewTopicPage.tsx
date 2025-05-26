
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { NewTopicForm } from '@/components/community/NewTopicForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ForumCategory } from '@/types/forumTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const NewTopicPage = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const navigate = useNavigate();

  const { data: category, isLoading, error } = useQuery({
    queryKey: ['forum-category', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return null;
      
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();
        
      if (error) throw error;
      return data as ForumCategory;
    },
    enabled: !!categorySlug,
    meta: {
      onSettled: (data, error) => {
        if (error && categorySlug) {
          console.error('Erro ao buscar categoria:', error);
          toast.error("Categoria não encontrada");
          navigate('/comunidade', { replace: true });
        }
      }
    }
  });

  const handleCancel = () => {
    if (categorySlug && category) {
      navigate(`/comunidade/categoria/${categorySlug}`);
    } else {
      navigate('/comunidade');
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-6">
      <ForumBreadcrumbs 
        categoryName={category?.name} 
        categorySlug={category?.slug}
        topicTitle="Novo tópico" 
      />

      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Criar novo tópico</h1>
        <p className="text-muted-foreground mt-2">
          {category ? `Categoria: ${category.name}` : 'Compartilhe suas dúvidas, ideias ou conhecimentos com a comunidade'}
        </p>
      </div>
      
      <CommunityNavigation />
      
      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        ) : (
          <NewTopicForm 
            categoryId={category?.id} 
            categorySlug={category?.slug}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default NewTopicPage;
