
import React from "react";
import { MemberLearningHeader } from "@/components/learning/member/MemberLearningHeader";
import { MemberCoursesList } from "@/components/learning/member/MemberCoursesList";
import { useLearningCourses } from "@/hooks/learning/useLearningCourses";
import { useUserProgress } from "@/hooks/learning/useUserProgress";
import { ContinueLearning } from "@/components/learning/member/ContinueLearning";
import { useDynamicSEO } from "@/hooks/seo/useDynamicSEO";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <MemberLearningHeader />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state (não crítico - mostra cursos vazios)
  if (error && courses.length === 0) {
    return (
      <div className="space-y-6">
        <MemberLearningHeader />
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Não foi possível carregar os cursos no momento. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
        <MemberCoursesList courses={[]} userProgress={userProgress || []} />
      </div>
    );
  }

  // Filtrar apenas cursos publicados
  const allCourses = courses.filter(course => course.published);
  
  return (
    <div className="space-y-6">
      <MemberLearningHeader />
      
      {/* Componente para continuar de onde parou */}
      <ContinueLearning className="mt-6" />
      
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 text-zinc-200">Todos os cursos</h2>
        <MemberCoursesList courses={allCourses} userProgress={userProgress || []} />
      </div>
    </div>
  );
}
