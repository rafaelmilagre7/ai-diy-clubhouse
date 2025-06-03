
import { Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { Link } from "react-router-dom";

interface EmptyCoursesStateProps {
  activeTab: string;
  message?: string;
}

export const EmptyCoursesState = ({ activeTab, message }: EmptyCoursesStateProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "formacao";

  const getMessage = () => {
    if (message) return message;
    
    switch (activeTab) {
      case "in-progress":
        return "Você ainda não iniciou nenhum curso";
      case "completed":
        return "Você ainda não concluiu nenhum curso";
      default:
        return "Nenhum curso disponível no momento";
    }
  };

  const getDescription = () => {
    switch (activeTab) {
      case "in-progress":
        return "Comece um curso para acompanhar seu progresso aqui.";
      case "completed":
        return "Continue aprendendo e conclua cursos para vê-los aqui.";
      default:
        return isAdmin 
          ? "Acesse o painel de administração para criar e publicar novos cursos e aulas." 
          : "Novos cursos serão disponibilizados em breve.";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-muted rounded-full p-4 mb-4">
        <Book className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">{getMessage()}</h3>
      <p className="text-muted-foreground mt-2">{getDescription()}</p>
      
      {isAdmin && (
        <div className="mt-6 space-y-2">
          {activeTab === "all" && (
            <Button asChild>
              <Link to="/formacao/cursos">
                Gerenciar Cursos e Aulas
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
