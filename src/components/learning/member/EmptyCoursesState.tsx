
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, LucideIcon } from "lucide-react";

interface EmptyCoursesStateProps {
  activeTab?: string;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  isAdmin?: boolean;
}

export const EmptyCoursesState = ({
  activeTab = "all",
  title,
  description,
  action,
  isAdmin = false
}: EmptyCoursesStateProps) => {
  const getMessage = () => {
    if (title) return title;
    
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
    if (description) return description;
    
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
    <Card className="w-full max-w-4xl mx-auto border border-dashed bg-background hover:bg-muted/50 transition-colors">
      <CardHeader className="flex flex-col items-center gap-1 pt-8">
        <div className="bg-primary/10 p-3 rounded-full">
          <GraduationCap className="h-10 w-10 text-primary" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl">{getMessage()}</CardTitle>
        <CardDescription className="text-center max-w-md">
          {getDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background border">
            <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="font-medium">Explore cursos</h3>
            <p className="text-sm text-muted-foreground">
              Fique atento a novos cursos que serão disponibilizados em breve.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background border">
            <GraduationCap className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="font-medium">Aprenda no seu ritmo</h3>
            <p className="text-sm text-muted-foreground">
              Assim que houver cursos disponíveis, você poderá estudar quando quiser.
            </p>
          </div>
        </div>
      </CardContent>
      {action && (
        <CardFooter className="justify-center pb-8">
          <Button onClick={action.onClick}>
            {action.icon && <action.icon className="h-4 w-4 mr-2" />}
            {action.label}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
