
import React from "react";
import { CourseCarousel } from "./CourseCarousel";
import { LearningCourse, LearningProgress } from "@/lib/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface MemberCoursesListProps {
  courses: LearningCourse[] | null;
  userProgress: LearningProgress[] | null;
  isLoading: boolean;
  error: Error | null;
}

export const MemberCoursesList: React.FC<MemberCoursesListProps> = ({ 
  courses, 
  userProgress, 
  isLoading, 
  error 
}) => {
  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar cursos: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  // Se não há cursos disponíveis
  if (!courses || courses.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Nenhum curso disponível no momento.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Todos os cursos */}
      <CourseCarousel
        title="Cursos Disponíveis"
        courses={courses}
        userProgress={userProgress || []}
        showEmptyMessage={false}
      />
    </div>
  );
};
