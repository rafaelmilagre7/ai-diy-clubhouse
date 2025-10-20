
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityCategory } from "@/types/communityTypes";
import { MessageSquare } from "lucide-react";

interface CategoryTabsProps {
  categories: CommunityCategory[] | undefined;
  isLoading: boolean;
}

const categoryColors = {
  'Geral': 'data-[state=active]:bg-operational/10 data-[state=active]:text-operational data-[state=active]:border-operational/30',
  'Suporte': 'data-[state=active]:bg-status-error/10 data-[state=active]:text-status-error data-[state=active]:border-status-error/30',
  'Implementação': 'data-[state=active]:bg-operational/10 data-[state=active]:text-operational data-[state=active]:border-operational/30',
  'Feedback': 'data-[state=active]:bg-strategy/10 data-[state=active]:text-strategy data-[state=active]:border-strategy/30'
};

export const CategoryTabs = ({ categories, isLoading }: CategoryTabsProps) => {
  if (isLoading) {
    return <Skeleton className="h-12 w-full" />;
  }

  return (
    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1 bg-muted/50">
      <TabsTrigger 
        value="todos" 
        className="min-w-max px-md py-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        <span className="font-medium">Todos</span>
      </TabsTrigger>
      
      {categories?.map((category) => (
        <TabsTrigger 
          key={category.id} 
          value={category.slug} 
          className={`min-w-max px-md py-md transition-all duration-200 ${
            categoryColors[category.name as keyof typeof categoryColors] || 
            'data-[state=active]:bg-muted data-[state=active]:text-foreground'
          }`}
        >
          <span className="mr-2 text-lg">
            {category.icon || '📁'}
          </span>
          <span className="font-medium">
            {category.name}
          </span>
          {category.topic_count !== undefined && (
            <span className="ml-2 px-2 py-0.5 bg-muted rounded-full text-xs">
              {category.topic_count}
            </span>
          )}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
