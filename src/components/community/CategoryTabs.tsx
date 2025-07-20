
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ForumCategory } from "@/types/forumTypes";
import { MessageSquare } from "lucide-react";

interface CategoryTabsProps {
  categories: ForumCategory[] | undefined;
  isLoading: boolean;
}

const categoryColors = {
  'Geral': 'data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200',
  'Suporte': 'data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:border-red-200',
  'Implementação': 'data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-green-200',
  'Feedback': 'data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-purple-200'
};

export const CategoryTabs = ({ categories, isLoading }: CategoryTabsProps) => {
  if (isLoading) {
    return <Skeleton className="h-12 w-full" />;
  }

  return (
    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1 bg-muted/50">
      <TabsTrigger 
        value="todos" 
        className="min-w-max px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        <span className="font-medium">Todos</span>
      </TabsTrigger>
      
      {categories?.map((category) => (
        <TabsTrigger 
          key={category.id} 
          value={category.slug} 
          className={`min-w-max px-4 py-3 transition-all duration-200 ${
            categoryColors[category.name as keyof typeof categoryColors] || 
            'data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700'
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
