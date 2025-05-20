
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CategoryTabsProps {
  categories: any[] | undefined;
  isLoading: boolean;
}

export const CategoryTabs = ({ categories, isLoading }: CategoryTabsProps) => {
  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <TabsList className="overflow-x-auto flex w-full h-auto p-1">
      <TabsTrigger value="todos" className="min-w-max">
        Todos os Tópicos
      </TabsTrigger>
      {categories?.map((category) => (
        <TabsTrigger key={category.id} value={category.slug} className="min-w-max">
          {category.name}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
