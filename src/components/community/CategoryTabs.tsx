
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ForumCategory } from "@/types/forumTypes";

interface CategoryTabsProps {
  categories: ForumCategory[] | undefined;
  isLoading: boolean;
}

export const CategoryTabs = ({ categories, isLoading }: CategoryTabsProps) => {
  if (isLoading) {
    return <Skeleton className="h-10 w-full bg-surface" />;
  }

  return (
    <TabsList className="overflow-x-auto flex w-full h-auto p-1 bg-surface-elevated border border-border">
      <TabsTrigger 
        value="todos" 
        className="min-w-max text-text-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
      >
        Todos os Tópicos
      </TabsTrigger>
      {categories?.map((category) => (
        <TabsTrigger 
          key={category.id} 
          value={category.slug} 
          className="min-w-max text-text-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          {category.name}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
