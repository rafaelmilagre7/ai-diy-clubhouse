
import { LearningCourse } from "@/lib/supabase";
import { CourseCard } from "./CourseCard";

interface MemberCoursesListProps {
  courses: LearningCourse[];
  userProgress: any[];
}

export const MemberCoursesList = ({ courses, userProgress }: MemberCoursesListProps) => {
  // Função para calcular o progresso do curso
  const calculateCourseProgress = (courseId: string) => {
    // Esta é uma implementação simplificada
    // Idealmente, você buscaria todas as lições do curso e verificaria o progresso de cada uma
    
    const courseProgress = userProgress.filter(p => {
      // Verifica se esta lição pertence a este curso
      // Esta lógica precisa ser adaptada com base na sua estrutura de dados
      return p.course_id === courseId;
    });
    
    if (courseProgress.length === 0) return 0;
    
    // Calcular média do progresso
    const totalProgress = courseProgress.reduce((sum, p) => sum + p.progress_percentage, 0);
    return Math.round(totalProgress / courseProgress.length);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          id={course.id}
          title={course.title}
          description={course.description || ""}
          coverImage={course.cover_image_url}
          progress={calculateCourseProgress(course.id)}
        />
      ))}
    </div>
  );
};
