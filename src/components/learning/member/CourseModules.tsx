import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LearningModule, LearningLesson } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LessonItem } from "./LessonItem";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CourseCertificate } from "./CourseCertificate";

interface CourseModulesProps {
  modules: LearningModule[];
  courseId: string;
  userProgress: any[];
  course: any;
}

export const CourseModules = ({ modules, courseId, userProgress, course }: CourseModulesProps) => {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Buscar lições para todos os módulos
  const { data: moduleLessons, isLoading } = useQuery({
    queryKey: ["learning-module-lessons", modules.map(m => m.id).join(',')],
    queryFn: async () => {
      const moduleIds = modules.map(m => m.id);
      
      const { data, error } = await supabase
        .from("learning_lessons")
        .select("*")
        .in("module_id", moduleIds)
        .eq("published", true)
        .order("order_index", { ascending: true });
        
      if (error) {
        console.error("Erro ao carregar aulas dos módulos:", error);
        return [];
      }
      
      // Agrupar lições por módulo
      const lessonsByModule: Record<string, LearningLesson[]> = {};
      
      data.forEach(lesson => {
        if (!lessonsByModule[lesson.module_id]) {
          lessonsByModule[lesson.module_id] = [];
        }
        lessonsByModule[lesson.module_id].push(lesson);
      });
      
      return lessonsByModule;
    },
    enabled: modules.length > 0
  });

  // Expandir o primeiro módulo automaticamente
  useState(() => {
    if (modules.length > 0 && !expandedModules.length) {
      setExpandedModules([modules[0].id]);
    }
  });
  
  // Verificar se um módulo tem todas as lições concluídas
  const isModuleCompleted = (moduleId: string) => {
    if (!moduleLessons || !moduleLessons[moduleId] || !userProgress) return false;
    
    const lessons = moduleLessons[moduleId];
    if (!lessons.length) return false;
    
    // Verificar se todas as lições têm progresso 100%
    const lessonsCompleted = lessons.every(lesson => {
      const progress = userProgress.find(p => p.lesson_id === lesson.id);
      return progress && progress.progress_percentage === 100;
    });
    
    return lessonsCompleted;
  };
  
  // Calcular progresso do módulo
  const calculateModuleProgress = (moduleId: string) => {
    if (!moduleLessons || !moduleLessons[moduleId] || !userProgress) return 0;
    
    const lessons = moduleLessons[moduleId];
    if (!lessons.length) return 0;
    
    let totalProgress = 0;
    let lessonsWithProgress = 0;
    
    lessons.forEach(lesson => {
      const progress = userProgress.find(p => p.lesson_id === lesson.id);
      if (progress) {
        totalProgress += progress.progress_percentage;
        lessonsWithProgress++;
      }
    });
    
    return lessonsWithProgress ? Math.round(totalProgress / lessons.length) : 0;
  };

  // Function to calculate course progress
  const calculateCourseProgress = (progressList: any[]): number => {
    if (!progressList || progressList.length === 0) return 0;
    
    const completedLessons = progressList.filter(p => p.completed_at).length;
    const totalLessons = progressList.length;
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  return (
    <Tabs defaultValue="modules" className="w-full">
      <TabsList>
        <TabsTrigger value="modules">Módulos</TabsTrigger>
        <TabsTrigger value="info">Informações</TabsTrigger>
        <TabsTrigger value="certificate">Certificado</TabsTrigger>
      </TabsList>
      <TabsContent value="modules">
        <Card>
          <CardContent className="p-0">
            <h2 className="text-xl font-semibold p-6">Conteúdo do Curso</h2>
            
            {isLoading ? (
              <p className="p-6">Carregando módulos...</p>
            ) : (
              <Accordion
                type="multiple"
                value={expandedModules}
                onValueChange={setExpandedModules}
                className="w-full"
              >
                {modules.map((module) => (
                  <AccordionItem key={module.id} value={module.id} className="border-b">
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                      <div className="flex flex-col items-start text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{module.title}</span>
                          {isModuleCompleted(module.id) && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                              Concluído
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground mt-1">
                          {moduleLessons && moduleLessons[module.id] 
                            ? `${moduleLessons[module.id].length} aulas • ${calculateModuleProgress(module.id)}% concluído`
                            : "Carregando..."}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0 py-0">
                      <div className="border-t">
                        {moduleLessons && moduleLessons[module.id] ? (
                          moduleLessons[module.id].map((lesson) => (
                            <LessonItem
                              key={lesson.id}
                              lesson={lesson}
                              courseId={courseId}
                              isCompleted={userProgress?.some(
                                p => p.lesson_id === lesson.id && p.progress_percentage === 100
                              )}
                            />
                          ))
                        ) : (
                          <div className="px-6 py-4 text-sm text-muted-foreground">
                            Este módulo ainda não possui aulas.
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="info">
        {/* ... keep existing info content */}
      </TabsContent>
      <TabsContent value="certificate">
        <CourseCertificate 
          course={course}
          progressPercentage={calculateCourseProgress(progress)}
        />
      </TabsContent>
    </Tabs>
  );
};
