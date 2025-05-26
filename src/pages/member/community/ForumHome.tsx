
import { useNavigate } from 'react-router-dom';
import { ForumHeader } from '@/components/community/ForumHeader';
import { CategoryList } from '@/components/community/CategoryList';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { useForumCategories } from '@/hooks/community/useForumCategories';

const ForumHome = () => {
  const navigate = useNavigate();
  const { categories, isLoading } = useForumCategories();

  const handleCategorySelect = (categorySlug: string) => {
    navigate(`/comunidade/categoria/${categorySlug}`);
  };

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs />
      
      <ForumHeader
        title="Comunidade Viver de IA"
        description="Compartilhe conhecimento, faça perguntas e conecte-se com outros membros da comunidade."
      />

      <CommunityNavigation />
      
      <div className="pb-10">
        {isLoading ? (
          <div>Carregando categorias...</div>
        ) : (
          <CategoryList 
            categories={categories}
            onCategorySelect={handleCategorySelect} 
          />
        )}
      </div>
    </div>
  );
};

export default ForumHome;
