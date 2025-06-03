
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "@/components/common/LoadingScreen";

interface Course {
  id: string;
  title: string;
  description: string;
  cover_image_url?: string;
  duration_hours?: number;
  published: boolean;
}

interface MemberCoursesListProps {
  courses: Course[];
  userProgress: any[];
  isLoading: boolean;
}

export const MemberCoursesList: React.FC<MemberCoursesListProps> = ({
  courses,
  userProgress,
  isLoading
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingScreen message="Carregando cursos..." />;
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum curso disponível</h3>
        <p className="text-muted-foreground">
          Novos cursos serão adicionados em breve!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => {
        // Calcular progresso do usuário neste curso (simplificado)
        const courseProgress = 0; // TODO: Calcular progresso real

        return (
          <Card 
            key={course.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/learning/course/${course.id}`)}
          >
            {course.cover_image_url && (
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img
                  src={course.cover_image_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="line-clamp-2">{course.title}</CardTitle>
              <CardDescription className="line-clamp-3">
                {course.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration_hours || 0}h</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>0 alunos</span>
                </div>
              </div>
              
              {courseProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{courseProgress}%</span>
                  </div>
                  <Progress value={courseProgress} className="h-2" />
                </div>
              )}
              
              <Badge variant="secondary">
                {courseProgress > 0 ? "Em andamento" : "Não iniciado"}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
