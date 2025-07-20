
import { CommunityStatistics } from "./CommunityStatistics";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface CommunityHeaderProps {
  title?: string;
  description?: string;
  showNewTopicButton?: boolean;
  onNewTopicClick?: () => void;
}

export const CommunityHeader = ({
  title = "Comunidade",
  description = "Compartilhe conhecimento, faça perguntas e conecte-se com outros membros da comunidade.",
  showNewTopicButton = true,
  onNewTopicClick
}: CommunityHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>
        
        {showNewTopicButton && onNewTopicClick && (
          <div className="mt-4 md:mt-0">
            <Button 
              onClick={onNewTopicClick}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Novo Tópico</span>
            </Button>
          </div>
        )}
      </div>
      
      <CommunityStatistics />
    </div>
  );
};
