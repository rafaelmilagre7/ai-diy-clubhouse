
import React from 'react';
import { ForumHeader } from "@/components/forum/ForumHeader";
import { CategoryCard } from "@/components/forum/CategoryCard";
import { useForumCategories } from '@/hooks/forum/useForumCategories';
import { useForumTopics } from '@/hooks/forum/useForumTopics';
import { TopicRow } from '@/components/forum/TopicRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ForumHomePage = () => {
  const { data: categories = [], isLoading: loadingCategories } = useForumCategories();
  const { data: recentTopics = [], isLoading: loadingTopics } = useForumTopics(null);
  
  // Calcular a última atividade para cada categoria
  const getCategoryActivity = (categoryId: string) => {
    const topicsInCategory = recentTopics.filter(topic => topic.category_id === categoryId);
    const topicCount = topicsInCategory.length;
    
    // Encontrar o tópico com atividade mais recente
    let latestActivity = null;
    if (topicCount > 0) {
      latestActivity = topicsInCategory.reduce((latest, topic) => {
        const topicDate = new Date(topic.last_activity_at);
        const latestDate = latest ? new Date(latest) : new Date(0);
        return topicDate > latestDate ? topic.last_activity_at : latest;
      }, null as string | null);
    }
    
    return {
      topicCount,
      latestActivity
    };
  };

  const renderCategorySkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </CardHeader>
          <CardContent className="flex justify-between pt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  const renderTopicsSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
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
        title="Fórum de Discussões" 
        description="Compartilhe conhecimentos, faça perguntas e ajude outros membros da comunidade"
        showNewTopicButton
      />
      
      <div className="grid gap-8">
        {/* Categorias */}
        <section>
          <h2 className="text-xl font-bold mb-4">Categorias</h2>
          {loadingCategories ? (
            renderCategorySkeleton()
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => {
                const { topicCount, latestActivity } = getCategoryActivity(category.id);
                return (
                  <CategoryCard 
                    key={category.id} 
                    category={category}
                    topicCount={topicCount}
                    lastActivity={latestActivity}
                  />
                );
              })}
            </div>
          )}
        </section>
        
        {/* Tópicos recentes */}
        <section>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Tópicos recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingTopics ? (
                renderTopicsSkeleton()
              ) : (
                <div className="divide-y">
                  {recentTopics.slice(0, 5).map((topic) => (
                    <TopicRow key={topic.id} topic={topic} />
                  ))}
                  
                  {recentTopics.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">
                      Nenhum tópico encontrado. Seja o primeiro a criar um!
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
