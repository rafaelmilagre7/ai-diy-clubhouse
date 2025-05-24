
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumHeader } from '@/components/community/ForumHeader';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { NewTopicForm } from '@/components/forum/NewTopicForm';
import { ForumCategory } from '@/types/forumTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const NewTopicPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();

  const { data: category, isLoading } = useQuery({
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
        if (error) {
          toast.error("Categoria não encontrada");
          navigate('/comunidade', { replace: true });
        }
      }
    }
  });
  
  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        categoryName={category?.name} 
        categorySlug={category?.slug}
        topicTitle="Novo tópico" 
      />
      
      <ForumHeader
        title="Criar novo tópico"
        description={`Categoria: ${category?.name || 'Carregando...'}`}
      />
      
      <CommunityNavigation activeTab={category?.slug} />
      
      <div className="mt-6 mb-10">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        ) : category ? (
          <NewTopicForm categoryId={category.id} categorySlug={category.slug} />
        ) : (
          <div className="text-center py-10">
            <p className="text-lg text-muted-foreground">Categoria não encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewTopicPage;
