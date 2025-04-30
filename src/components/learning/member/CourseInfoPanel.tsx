
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LearningCourse } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CourseInfoPanelProps {
  course: LearningCourse;
  moduleCount: number;
}

export const CourseInfoPanel = ({ course, moduleCount }: CourseInfoPanelProps) => {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ptBR 
      });
    } catch (error) {
      return "Data desconhecida";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Informações do curso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium">Módulos</h4>
          <p className="text-sm text-muted-foreground">{moduleCount} módulo(s)</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium">Criado</h4>
          <p className="text-sm text-muted-foreground">{formatDate(course.created_at)}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium">Última atualização</h4>
          <p className="text-sm text-muted-foreground">{formatDate(course.updated_at)}</p>
        </div>
      </CardContent>
    </Card>
  );
};
