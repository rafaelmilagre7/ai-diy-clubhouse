
import React from 'react';
import { useParams } from 'react-router-dom';
import { ForumHeader } from '@/components/forum/ForumHeader';
import { TopicRow } from '@/components/forum/TopicRow';
import { useForumCategories } from '@/hooks/forum/useForumCategories';
import { useForumTopics } from '@/hooks/forum/useForumTopics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories = [], isLoading: loadingCategories } = useForumCategories();
  
  // Encontrar a categoria atual pelo slug
  const currentCategory = categories.find(cat => cat.slug === slug);
  
  // Buscar tópicos desta categoria
  const { data: topics = [], isLoading: loadingTopics } = useForumTopics(currentCategory?.id);
  
  // Renderizar esqueletos de carregamento
  const renderTopicSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-9 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="col-span-12 md:col-span-3 flex justify-end items-center space-x-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container py-8">
      <ForumHeader 
        title={loadingCategories ? "Carregando categoria..." : currentCategory?.name || "Categoria não encontrada"} 
        description={currentCategory?.description || ""}
        showNewTopicButton
        categorySlug={slug}
        breadcrumbs={[
          { name: 'Categorias', href: '/forum' },
          { name: currentCategory?.name || 'Categoria', href: `/forum/categoria/${slug}` }
        ]}
      />
      
      <div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Tópicos da categoria</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingTopics ? (
              renderTopicSkeleton()
            ) : (
              <div className="divide-y">
                {topics.map((topic) => (
                  <TopicRow key={topic.id} topic={topic} />
                ))}
                
                {topics.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    Nenhum tópico encontrado nesta categoria.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
