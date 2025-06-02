
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CourseDetailsSkeleton } from "@/components/learning/member/CourseDetailsSkeleton";
import { CourseModules } from "@/components/learning/member/CourseModules";
import { CourseHeader } from "@/components/learning/member/CourseHeader";
import { CourseProgress } from "@/components/learning/member/CourseProgress";
import { AccessDeniedPage } from "@/components/learning/member/AccessDeniedPage";
import { ArrowLeft } from "lucide-react";
import { useCourseDetailsWithAccess } from "@/hooks/learning/useCourseDetailsWithAccess";
import { useCourseStats } from "@/hooks/learning/useCourseStats";

const CourseDetailsWithAccess = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    course, 
    modules, 
    allLessons, 
    userProgress, 
    hasAccess,
    requiredRoles,
    isLoading, 
    accessDenied 
  } = useCourseDetailsWithAccess(id);
  
  const { courseStats, firstLessonId, courseProgress } = useCourseStats({ 
    modules, 
    allLessons, 
    userProgress 
  });

  // Se está carregando, mostrar skeleton
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

  // Se não foi encontrado o curso
  if (!course) {
    navigate("/learning");
    return null;
  }

  // Se o acesso foi negado, mostrar página específica
  if (accessDenied) {
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
        
        <AccessDeniedPage 
          courseTitle={course.title}
          requiredRoles={requiredRoles}
        />
      </div>
    );
  }

  // Se tem acesso, mostrar conteúdo normal
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
        courseId={id!}
      />
      
      <div className="mt-6">
        <CourseProgress 
          percentage={courseProgress} 
          className="mb-6"
        />
        
        <CourseModules 
          modules={modules || []} 
          courseId={id!} 
          userProgress={userProgress || []}
          course={course}
          expandedModules={[modules?.[0]?.id].filter(Boolean)}
        />
      </div>
    </div>
  );
};

export default CourseDetailsWithAccess;
