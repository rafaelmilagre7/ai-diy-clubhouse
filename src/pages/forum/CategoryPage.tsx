
import React from 'react';
import { useParams } from 'react-router-dom';
import { ForumHeader } from "@/components/forum/ForumHeader";
import { TopicRow } from '@/components/forum/TopicRow';
import { useForumCategories } from '@/hooks/forum/useForumCategories';
import { useForumTopics } from '@/hooks/forum/useForumTopics';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories = [], isLoading: loadingCategories } = useForumCategories();
  
  // Encontrar a categoria pelo slug
  const category = categories.find(c => c.slug === slug);
  
  // Buscar tópicos apenas quando a categoria for encontrada
  const { data: topics = [], isLoading: loadingTopics } = useForumTopics(
    category?.id
  );
  
  const renderTopicsSkeleton = () => (
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

  if (loadingCategories) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-1/2 mb-2" />
        <Skeleton className="h-6 w-2/3 mb-8" />
        {renderTopicsSkeleton()}
      </div>
    );
  }
  
  if (!category) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Categoria não encontrada</CardTitle>
            <CardDescription>
              A categoria que você está procurando não existe ou foi removida.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <ForumHeader 
        title={category.name} 
        description={category.description || undefined}
        showNewTopicButton
        categorySlug={category.slug}
        breadcrumbs={[
          { name: 'Categorias', href: '/forum' },
          { name: category.name, href: `/forum/categoria/${category.slug}` }
        ]}
      />
      
      <div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Tópicos nesta categoria</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingTopics ? (
              renderTopicsSkeleton()
            ) : (
              <div className="divide-y">
                {topics.map((topic) => (
                  <TopicRow key={topic.id} topic={topic} />
                ))}
                
                {topics.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    Nenhum tópico encontrado nesta categoria. Seja o primeiro a criar um!
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
