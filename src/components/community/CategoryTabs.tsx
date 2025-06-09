
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { ForumCategory } from "@/types/forumTypes";
import { MessageSquare, Users, Hash, Sparkles } from "lucide-react";

interface CategoryTabsProps {
  categories: ForumCategory[] | undefined;
  isLoading: boolean;
  activeCounts?: Record<string, number>;
}

export const CategoryTabs = ({ 
  categories, 
  isLoading,
  activeCounts = {}
}: CategoryTabsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 bg-surface-elevated" />
            <Skeleton className="h-4 w-48 bg-surface-elevated" />
          </div>
          <Skeleton className="h-5 w-20 bg-surface-elevated" />
        </div>
        <Skeleton className="h-12 w-full bg-surface-elevated rounded-xl" />
      </div>
    );
  }

  const totalTopics = Object.values(activeCounts).reduce((acc, count) => acc + count, 0);

  return (
    <div className="space-y-4">
      {/* Header da comunidade */}
      <div className="flex items-center justify-between">
        <div>
          <Text variant="subsection" textColor="primary" className="font-bold">
            Categorias da Comunidade
          </Text>
          <Text variant="body-small" textColor="secondary">
            Participe das discussões e compartilhe conhecimento
          </Text>
        </div>
        
        <div className="hidden md:flex items-center gap-2">
          <Users className="h-4 w-4 text-accent" />
          <Text variant="caption" textColor="accent" className="font-medium">
            {totalTopics} tópicos ativos
          </Text>
        </div>
      </div>

      {/* Tabs modernos */}
      <TabsList className="w-full h-auto p-1 bg-surface-elevated border border-border-subtle rounded-xl overflow-x-auto flex gap-1">
        <TabsTrigger 
          value="todos" 
          className="min-w-max flex items-center gap-2 text-text-secondary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 rounded-lg px-4 py-2.5"
        >
          <Hash className="h-4 w-4" />
          <span className="font-medium">Todos os Tópicos</span>
          {totalTopics > 0 && (
            <Badge variant="secondary" size="xs" className="ml-1">
              {totalTopics}
            </Badge>
          )}
        </TabsTrigger>
        
        {categories?.map((category) => {
          const count = activeCounts[category.slug] || 0;
          return (
            <TabsTrigger 
              key={category.id} 
              value={category.slug} 
              className="min-w-max flex items-center gap-2 text-text-secondary data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 rounded-lg px-4 py-2.5 hover:bg-surface-hover"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">{category.name}</span>
              {count > 0 && (
                <Badge variant="secondary" size="xs" className="ml-1">
                  {count}
                </Badge>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* Indicador de categoria ativa */}
      <div className="hidden md:block">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/10">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <Text variant="body" textColor="primary" className="font-semibold">
              Bem-vindo à Comunidade
            </Text>
            <Text variant="caption" textColor="secondary">
              Conecte-se com outros membros, faça perguntas e compartilhe suas experiências
            </Text>
          </div>
          <Badge variant="accent" className="shadow-sm">
            <Users className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        </div>
      </div>
    </div>
  );
};
