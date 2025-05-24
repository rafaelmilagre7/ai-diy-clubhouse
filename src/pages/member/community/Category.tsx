
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumHeader } from '@/components/community/ForumHeader';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { Button } from '@/components/ui/button';
import { SimpleTopicList } from '@/components/community/TopicList';
import { PlusCircle } from 'lucide-react';
import { ForumCategory } from '@/types/forumTypes';
import { CreateTopicDialog } from '@/components/community/CreateTopicDialog';
import { useState } from 'react';
import { EmptyTopicsState } from '@/components/community/EmptyTopicsState';

const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const [createTopicOpen, setCreateTopicOpen] = useState(false);

  const { data: category, isLoading: categoryLoading } = useQuery({
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
    enabled: !!categorySlug
  });

  const handleCreateNewTopic = () => {
    navigate(`/comunidade/novo-topico/${categorySlug}`);
  };

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        categoryName={category?.name} 
        categorySlug={categorySlug}
      />
      
      <ForumHeader
        title={category?.name || 'Carregando...'}
        description={category?.description || ''}
      />
      
      <CommunityNavigation activeTab={categorySlug} />
      
      <div className="flex items-center justify-between mt-6 mb-4">
        <h3 className="text-xl font-medium">Tópicos</h3>
        
        <Button onClick={handleCreateNewTopic}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Tópico
        </Button>
      </div>
      
      {category ? (
        <SimpleTopicList categoryId={category.id} categorySlug={categorySlug} />
      ) : (
        <EmptyTopicsState 
          categorySlug={categorySlug} 
          onNewTopic={handleCreateNewTopic}
          message="Categoria não encontrada ou sem tópicos." 
        />
      )}
      
      <CreateTopicDialog 
        open={createTopicOpen} 
        onOpenChange={setCreateTopicOpen}
        preselectedCategory={category?.id}
      />
    </div>
  );
};

export default CategoryPage;
