
import React from "react";
import { MemberLearningHeader } from "@/components/learning/member/MemberLearningHeader";
import { MemberCoursesList } from "@/components/learning/member/MemberCoursesList";
import { useLearningCourses } from "@/hooks/learning/useLearningCourses";
import { useUserProgress } from "@/hooks/learning/useUserProgress";
import { ContinueLearning } from "@/components/learning/member/ContinueLearning";

export default function LearningPage() {
  const { courses, isLoading } = useLearningCourses();
  const { userProgress } = useUserProgress();
  
  console.log('🎓 LearningPage: Carregando cursos', { 
    coursesCount: courses?.length,
    isLoading,
    courses: courses?.map(c => ({ id: c.id, title: c.title, published: c.published }))
  });
  
  // Filtrar apenas cursos publicados
  const publishedCourses = courses?.filter(course => course.published) || [];
  
  console.log('📚 LearningPage: Cursos publicados', { 
    publishedCount: publishedCourses.length,
    publishedCourses: publishedCourses.map(c => ({ id: c.id, title: c.title }))
  });
  
  return (
    <div className="space-y-6">
      <MemberLearningHeader />
      
      {/* Componente para continuar de onde parou */}
      <ContinueLearning className="mt-6" />
      
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">
          Todos os cursos ({publishedCourses.length})
        </h2>
        <MemberCoursesList 
          courses={publishedCourses}
          userProgress={userProgress || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
