
import { ForumStatistics } from "./ForumStatistics";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useForumCategories } from "@/hooks/community/useForumCategories";

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
  categorySlug
}: ForumHeaderProps) => {
  const { categories } = useForumCategories();
  
  // Garantir que temos um slug de categoria válido para o botão de novo tópico
  const getValidCategorySlug = () => {
    // Se já temos um slug e ele é válido, usa ele
    if (categorySlug && categories?.some(cat => cat.slug === categorySlug)) {
      return categorySlug;
    }
    // Caso contrário usa a primeira categoria
    return categories && categories.length > 0 ? categories[0].slug : "";
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>
        
        {showNewTopicButton && categories && categories.length > 0 && (
          <div className="mt-4 md:mt-0">
            <Button asChild className="flex items-center gap-2">
              <Link to={`/comunidade/novo-topico/${getValidCategorySlug()}`}>
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
