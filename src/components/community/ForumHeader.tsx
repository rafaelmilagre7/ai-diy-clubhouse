
import { ForumStatistics } from "./ForumStatistics";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForumCategories } from "@/hooks/community/useForumCategories";
import { CreateTopicDialog } from "./CreateTopicDialog";
import { Skeleton } from "@/components/ui/skeleton";

export interface ForumHeaderProps {
  title?: string;
  description?: string;
  showNewTopicButton?: boolean;
  categorySlug?: string;
  isLoading?: boolean;
}

export const ForumHeader = ({
  title = "Comunidade",
  description = "Compartilhe conhecimento, faça perguntas e conecte-se com outros membros da comunidade.",
  showNewTopicButton = true,
  categorySlug,
  isLoading = false
}: ForumHeaderProps) => {
  const { categories } = useForumCategories();
  const [createTopicOpen, setCreateTopicOpen] = useState(false);
  
  // Encontrar o ID da categoria com base no slug
  const getValidCategoryId = () => {
    if (categorySlug) {
      const category = categories?.find(cat => cat.slug === categorySlug);
      if (category) return category.id;
    }
    
    return categories && categories.length > 0 ? categories[0].id : "";
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex flex-col space-y-2 mb-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>
        
        {showNewTopicButton && categories && categories.length > 0 && (
          <div className="mt-4 md:mt-0">
            <Button 
              onClick={() => setCreateTopicOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Novo Tópico</span>
            </Button>
          </div>
        )}
        
        <CreateTopicDialog 
          open={createTopicOpen} 
          onOpenChange={setCreateTopicOpen}
          preselectedCategory={getValidCategoryId()}
        />
      </div>
      
      <ForumStatistics />
    </div>
  );
};
