
import { useParams } from 'react-router-dom';
import { ForumHeader } from '@/components/community/ForumHeader';
import { TopicList } from '@/components/community/TopicList';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumCategory } from '@/types/forumTypes';

const CategoryView = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['forum-category', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', slug)
        .single();
        
      if (error) throw error;
      return data as ForumCategory;
    },
    enabled: !!slug
  });

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        categoryName={category?.name} 
        categorySlug={category?.slug} 
      />
      
      <div className="flex justify-between items-center mb-6">
        <ForumHeader
          title={category?.name || 'Carregando...'}
          description={category?.description || ''}
          isLoading={categoryLoading}
        />
        
        {category?.id && (
          <Button asChild>
            <Link to={`/comunidade/novo-topico/${slug}`}>
              Criar novo tópico
            </Link>
          </Button>
        )}
      </div>

      <CommunityNavigation activeCategory={category?.slug} />
      
      {category?.id && (
        <TopicList categoryId={category.id} />
      )}
    </div>
  );
};

export default CategoryView;
