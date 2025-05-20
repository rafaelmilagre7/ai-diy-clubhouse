
import { ForumStatistics } from "./ForumStatistics";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface ForumHeaderProps {
  title?: string;
  description?: string;
  showNewTopicButton?: boolean;
  categorySlug?: string;
}

export const ForumHeader = ({
  title = "Comunidade",
  description = "Compartilhe conhecimento, faça perguntas e conecte-se com outros membros da comunidade.",
  showNewTopicButton = true,
  categorySlug = "geral"
}: ForumHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>
        
        {showNewTopicButton && (
          <div className="mt-4 md:mt-0">
            <Button asChild className="flex items-center gap-2">
              <Link to={`/comunidade/novo-topico/${categorySlug}`}>
                <PlusCircle className="h-4 w-4" />
                <span>Novo Tópico</span>
              </Link>
            </Button>
          </div>
        )}
      </div>
      
      <ForumStatistics />
    </div>
  );
};
