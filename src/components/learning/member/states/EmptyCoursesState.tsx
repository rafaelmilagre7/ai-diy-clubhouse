
import { Book } from "lucide-react";

interface EmptyCoursesStateProps {
  activeTab: "all" | "in-progress" | "completed";
}

export const EmptyCoursesState = ({ activeTab }: EmptyCoursesStateProps) => {
  const getMessage = () => {
    switch (activeTab) {
      case "all":
        return "Ainda não temos cursos disponíveis.";
      case "in-progress":
        return "Você ainda não começou nenhum curso.";
      case "completed":
        return "Você ainda não completou nenhum curso.";
      default:
        return "Nenhum curso encontrado.";
    }
  };

  const getAction = () => {
    switch (activeTab) {
      case "all":
        return "Os cursos serão adicionados em breve.";
      case "in-progress":
        return "Comece um curso para aparecer aqui.";
      case "completed":
        return "Complete um curso para aparecer aqui.";
      default:
        return "Volte em breve.";
    }
  };

  return (
    <div className="text-center py-16">
      <div className="bg-muted w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
        <Book className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-medium mb-1">{getMessage()}</h3>
      <p className="text-muted-foreground">{getAction()}</p>
    </div>
  );
};
