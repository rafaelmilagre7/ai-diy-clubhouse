
import React from "react";
import { MemberLearningHeader } from "@/components/learning/member/MemberLearningHeader";
import { CourseCarousel } from "@/components/learning/member/CourseCarousel";
import { useLearningCourses } from "@/hooks/learning/useLearningCourses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserProgress } from "@/hooks/learning/useUserProgress";
import { MemberCoursesList } from "@/components/learning/member/MemberCoursesList";

export default function LearningPage() {
  const { courses, isLoading } = useLearningCourses();
  const { userProgress } = useUserProgress();
  
  // Filtrar cursos por categoria
  const recommendedCourses = courses
    .filter(course => course.published)
    .slice(0, 4); // Pega os 4 primeiros cursos publicados como recomendados

  // Filtrar cursos recentes com base na data de criação (últimos 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentCourses = courses
    .filter(course => course.published && new Date(course.created_at) > thirtyDaysAgo)
    .slice(0, 4);

  // Todos os cursos publicados
  const allCourses = courses.filter(course => course.published);
  
  return (
    <div className="space-y-6">
      <MemberLearningHeader />
      
      <Tabs defaultValue="todos" className="space-y-6">
        <div className="flex justify-end">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="progresso">Em Progresso</TabsTrigger>
            <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="todos" className="space-y-6">
          {recommendedCourses.length > 0 && (
            <CourseCarousel 
              title="Recomendados para você"
              courses={recommendedCourses}
              userProgress={userProgress}
            />
          )}
          
          {recentCourses.length > 0 && (
            <CourseCarousel 
              title="Adicionados recentemente"
              courses={recentCourses}
              userProgress={userProgress}
            />
          )}
          
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Todos os cursos</h2>
            <MemberCoursesList 
              courses={allCourses}
              userProgress={userProgress}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="progresso">
          <div className="py-3">
            <h2 className="text-2xl font-semibold mb-6">Cursos em progresso</h2>
            <MemberCoursesList 
              courses={allCourses.filter(course => {
                // Calcular se o curso está em progresso
                const courseProgress = userProgress.filter(p => 
                  p.lesson?.module?.course_id === course.id
                );
                return courseProgress.length > 0;
              })}
              userProgress={userProgress}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="concluidos">
          <div className="py-3">
            <h2 className="text-2xl font-semibold mb-6">Cursos concluídos</h2>
            <MemberCoursesList 
              courses={allCourses.filter(course => {
                // Cursos concluídos: todos os cursos onde pelo menos uma lição foi completada
                const courseLessons = userProgress.filter(p => 
                  p.lesson?.module?.course_id === course.id
                );
                
                // Se não há lições ou o curso não tem progresso registrado
                if (courseLessons.length === 0) return false;
                
                // Verificar se todas as lições do curso foram completadas
                const completedLessons = courseLessons.filter(p => p.completed_at);
                return completedLessons.length > 0 && completedLessons.length === courseLessons.length;
              })}
              userProgress={userProgress}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
