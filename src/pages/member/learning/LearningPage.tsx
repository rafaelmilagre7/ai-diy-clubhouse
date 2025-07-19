
import React from "react";
import { MemberLearningHeader } from "@/components/learning/member/MemberLearningHeader";
import { MemberCoursesList } from "@/components/learning/member/MemberCoursesList";
import { useLearningCourses } from "@/hooks/learning/useLearningCourses";
import { useUserProgress } from "@/hooks/learning/useUserProgress";
import { ContinueLearning } from "@/components/learning/member/ContinueLearning";
import { useDynamicSEO } from "@/hooks/seo/useDynamicSEO";

export default function LearningPage() {
  const {
    courses,
    isLoading,
    error
  } = useLearningCourses();
  
  const {
    userProgress
  } = useUserProgress();

  // SEO otimizado para página de aprendizado
  useDynamicSEO({
    title: 'Cursos de IA',
    description: 'Aprenda Inteligência Artificial através de cursos práticos e implementações reais. Desenvolva suas habilidades em IA de forma estruturada.',
    keywords: 'cursos IA, aprendizado inteligência artificial, formação IA, educação AI'
  });

  console.log('[LEARNING-PAGE] Estado atual:', {
    coursesCount: courses?.length || 0,
    isLoading,
    hasError: !!error,
    userProgressCount: userProgress?.length || 0
  });

  return (
    <div className="space-y-6">
      <MemberLearningHeader />
      
      {/* Componente para continuar de onde parou */}
      <ContinueLearning className="mt-6" />
      
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 text-zinc-200">Todos os cursos</h2>
        <MemberCoursesList 
          courses={courses} 
          userProgress={userProgress}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
