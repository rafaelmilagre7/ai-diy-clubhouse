
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CourseDetailsSkeleton } from "@/components/learning/member/CourseDetailsSkeleton";
import { CourseModules } from "@/components/learning/member/CourseModules";
import { CourseHeader } from "@/components/learning/member/CourseHeader";
import { CourseProgress } from "@/components/learning/member/CourseProgress";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useCourseDetails } from "@/hooks/learning/useCourseDetails";
import { useCourseStats } from "@/hooks/learning/useCourseStats";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { course, modules, allLessons, userProgress, isLoading, error } = useCourseDetails(id);
  const { courseStats, firstLessonId, courseProgress } = useCourseStats({ 
    modules, 
    allLessons, 
    userProgress 
  });

  // Se ainda está carregando, mostrar skeleton
  if (isLoading) {
    return (
      <div className="container pt-6 pb-12">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/learning")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Cursos
        </Button>
        <CourseDetailsSkeleton />
      </div>
    );
  }

  // Se houve erro ou curso não encontrado
  if (error || !course) {
    return (
      <div className="container pt-6 pb-12">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/learning")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Cursos
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Curso não encontrado</AlertTitle>
          <AlertDescription>
            {error?.message || "Não foi possível carregar os dados deste curso. Você será redirecionado em alguns segundos."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Definir módulos expandidos (primeiro módulo)
  const expandedModules = modules && modules.length > 0 ? [modules[0].id] : [];

  return (
    <div className="container pt-6 pb-12">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate("/learning")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Cursos
      </Button>
      
      <CourseHeader 
        title={course.title} 
        description={course.description} 
        coverImage={course.cover_image_url}
        stats={courseStats}
        firstLessonId={firstLessonId}
        courseId={id}
      />
      
      <div className="mt-6">
        <CourseProgress 
          percentage={courseProgress} 
          className="mb-6"
        />
        
        <CourseModules 
          modules={modules} 
          courseId={id} 
          userProgress={userProgress}
          course={course}
          expandedModules={expandedModules}
        />
      </div>
    </div>
  );
};

export default CourseDetails;
