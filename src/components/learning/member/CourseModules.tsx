
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, PlayCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CourseModulesProps {
  modules: any[];
  userProgress: any[];
  courseId: string;
  course: {
    id: string;
    title: string;
    description?: string;
  };
}

export const CourseModules: React.FC<CourseModulesProps> = ({
  modules,
  userProgress,
  courseId,
  course
}) => {
  const navigate = useNavigate();

  if (!modules || modules.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Nenhum módulo disponível</h3>
        <p className="text-muted-foreground">
          Este curso ainda não possui módulos publicados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Módulos do Curso</h2>
      
      {modules.map((module, index) => {
        const moduleProgress = 0; // TODO: Calcular progresso real do módulo
        
        return (
          <Card key={module.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    Módulo {index + 1}: {module.title}
                  </CardTitle>
                  {module.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {module.description}
                    </p>
                  )}
                </div>
                <Badge variant="outline">
                  {moduleProgress > 0 ? `${moduleProgress}%` : "Não iniciado"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {moduleProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{moduleProgress}%</span>
                  </div>
                  <Progress value={moduleProgress} className="h-2" />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <PlayCircle className="w-4 h-4" />
                  <span>0 aulas</span>
                </div>
                
                <button
                  onClick={() => navigate(`/learning/course/${courseId}/module/${module.id}`)}
                  className="flex items-center space-x-1 text-sm text-viverblue hover:text-viverblue-dark transition-colors"
                >
                  <span>Acessar módulo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
