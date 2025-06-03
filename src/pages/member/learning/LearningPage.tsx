
import React from "react";
import { MemberLearningHeader } from "@/components/learning/member/MemberLearningHeader";
import { MemberCoursesList } from "@/components/learning/member/MemberCoursesList";
import { useLearningCourses } from "@/hooks/learning/useLearningCourses";
import { useUserProgress } from "@/hooks/learning/useUserProgress";
import { ContinueLearning } from "@/components/learning/member/ContinueLearning";

export default function LearningPage() {
  const { courses, isLoading } = useLearningCourses();
  const { userProgress } = useUserProgress();
  
  // Filtrar apenas cursos publicados
  const allCourses = courses.filter(course => course.published);
  
  return (
    <div className="space-y-6">
      <MemberLearningHeader />
      
      {/* Componente para continuar de onde parou */}
      <ContinueLearning className="mt-6" />
      
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Todos os cursos</h2>
        <MemberCoursesList 
          courses={allCourses}
          userProgress={userProgress}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
