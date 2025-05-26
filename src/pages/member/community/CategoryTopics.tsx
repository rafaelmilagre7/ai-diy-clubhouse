
import { useParams } from 'react-router-dom';
import { useForumCategories } from '@/hooks/community/useForumCategories';
import { useTopicList } from '@/hooks/useTopicList';
import { ForumHeader } from '@/components/community/ForumHeader';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { TopicList } from '@/components/community/TopicList';
import { TopicListError } from '@/components/community/TopicListError';
import { TopicListSkeleton } from '@/components/community/TopicListSkeleton';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';

const CategoryTopics = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { categories, isLoading: categoriesLoading } = useForumCategories();
  
  const currentCategory = categories?.find(cat => cat.slug === categorySlug);
  
  const {
    pinnedTopics,
    regularTopics,
    isLoading,
    error,
    handleRetry,
    currentPage,
    totalPages,
    handlePageChange
  } = useTopicList({
    categoryId: currentCategory?.id || '',
    categorySlug
  });

  const isLoadingContent = isLoading || categoriesLoading || !currentCategory;
  
  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs categorySlug={categorySlug} />
      
      <ForumHeader
        title={currentCategory?.name || 'Carregando...'}
        description={currentCategory?.description || 'Carregando descrição da categoria...'}
        categorySlug={categorySlug}
      />

      <CommunityNavigation />
      
      <div className="space-y-8 pb-10">
        {isLoadingContent ? (
          <TopicListSkeleton />
        ) : error ? (
          <TopicListError 
            onRetry={handleRetry} 
            categorySlug={categorySlug}
          />
        ) : (
          <TopicList
            pinnedTopics={pinnedTopics}
            regularTopics={regularTopics}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryTopics;
