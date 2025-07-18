
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CourseDetailsSkeleton } from "@/components/learning/member/CourseDetailsSkeleton";
import { CourseModules } from "@/components/learning/member/CourseModules";
import { CourseHeader } from "@/components/learning/member/CourseHeader";
import { CourseProgress } from "@/components/learning/member/CourseProgress";
import { ArrowLeft } from "lucide-react";
import { useCourseDetails } from "@/hooks/learning/useCourseDetails";
import { useCourseStats } from "@/hooks/learning/useCourseStats";
import { AccessDenied } from "@/components/learning/member/AccessDenied";

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Log para verificar se o id está sendo capturado corretamente
  console.log("CourseDetails - parâmetro id da URL:", id);
  
  // Usar nossos hooks customizados
  const { course, modules, allLessons, userProgress, isLoading, accessDenied } = useCourseDetails(id);
  const { courseStats, firstLessonId, courseProgress } = useCourseStats({ 
    modules, 
    allLessons, 
    userProgress 
  });

  // Log para depuração
  console.log("CourseDetails - Dados do curso carregados:", {
    courseId: id,
    courseTitle: course?.title,
    modulesCount: modules?.length || 0,
    allLessonsCount: allLessons?.length || 0,
    firstLessonId,
    accessDenied,
    isLoading
  });

  // Se o acesso foi negado, mostrar o componente específico
  if (accessDenied) {
    console.log("Acesso negado - exibindo componente AccessDenied");
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
        
        <AccessDenied courseId={id} />
      </div>
    );
  }

  // Se o curso não foi encontrado, o hook de useCourseDetails já fará o redirecionamento
  if (!id || !course) {
    console.log("Curso não encontrado, redirecionando...");
    return null;
  }

  // Definir quais módulos devem ser expandidos por padrão (primeiro módulo)
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
      
      {isLoading ? (
        <CourseDetailsSkeleton />
      ) : (
        <>
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
              modules={modules || []} 
              courseId={id} 
              userProgress={userProgress || []}
              course={course}
              expandedModules={expandedModules}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CourseDetails;
