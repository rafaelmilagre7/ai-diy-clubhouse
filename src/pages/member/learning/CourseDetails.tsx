
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CourseDetailsSkeleton } from "@/components/learning/member/CourseDetailsSkeleton";
import { CourseModules } from "@/components/learning/member/CourseModules";
import { CourseHeader } from "@/components/learning/member/CourseHeader";
import { CourseProgress } from "@/components/learning/member/CourseProgress";
import { ArrowLeft } from "lucide-react";
import { useCourseDetails } from "@/hooks/learning/useCourseDetails";
import { useCourseStats } from "@/hooks/learning/useCourseStats";

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Usar nossos hooks customizados
  const { course, modules, allLessons, userProgress, isLoading } = useCourseDetails(id);
  const { courseStats, firstLessonId, courseProgress } = useCourseStats({ 
    modules, 
    allLessons, 
    userProgress 
  });

  // Se o curso não foi encontrado, o hook de useCourseDetails já fará o redirecionamento
  if (!id || !course) {
    return null;
  }

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
          
          <div className="mt-8">
            <CourseProgress 
              percentage={courseProgress} 
              className="mb-8"
            />
            
            <CourseModules 
              modules={modules || []} 
              courseId={id} 
              userProgress={userProgress || []}
              course={course}
              expandedModules={[modules?.[0]?.id].filter(Boolean)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CourseDetails;
