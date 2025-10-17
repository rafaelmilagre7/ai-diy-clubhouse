
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCommunityCategories } from "@/hooks/community/useCommunityCategories";
import { useState } from "react";
import { CreateTopicDialog } from "./CreateTopicDialog";

interface TopicListErrorProps {
  onRetry: () => void;
  categorySlug?: string;
}

export const TopicListError = ({ onRetry, categorySlug }: TopicListErrorProps) => {
  const [createTopicOpen, setCreateTopicOpen] = useState(false);
  const { categories } = useCommunityCategories();
  
  const getValidCategoryId = () => {
    if (categorySlug) {
      const category = categories?.find(cat => cat.slug === categorySlug);
      if (category) return category.id;
    }
    
    return categories && categories.length > 0 ? categories[0].id : "";
  };
  
  return (
    <div className="text-center py-8 space-y-4 border border-status-error/30 rounded-lg bg-status-error/10 p-6">
      <CircleAlert className="h-12 w-12 mx-auto text-status-error mb-4" />
      <h3 className="text-xl font-medium mb-2">Erro ao carregar tópicos</h3>
      <p className="text-muted-foreground mb-2">
        Não foi possível carregar os tópicos desta categoria devido a um problema de conexão com o servidor.
      </p>
      <Separator className="my-4" />
      <div className="flex flex-col items-center">
        <p className="text-sm text-muted-foreground mb-4">
          Tente novamente ou crie um novo tópico.
        </p>
        <div className="flex gap-3">
          <Button 
            onClick={onRetry}
            variant="outline"
            size="lg"
          >
            Tentar novamente
          </Button>
          
          <Button 
            onClick={() => setCreateTopicOpen(true)}
            size="lg"
          >
            Criar novo tópico
          </Button>
        </div>
        
        <CreateTopicDialog 
          open={createTopicOpen} 
          onOpenChange={setCreateTopicOpen}
          preselectedCategory={getValidCategoryId()}
        />
      </div>
    </div>
  );
};
