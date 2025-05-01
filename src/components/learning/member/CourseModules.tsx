
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LearningModule, LearningLesson } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LessonItem } from "./LessonItem";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CourseCertificate } from "./CourseCertificate";
import { Video, Clock, CheckCircle } from "lucide-react";

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
        .select("*, learning_lesson_videos(count)")
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
  
  // Buscar informações de vídeos para cada aula
  const { data: lessonVideos } = useQuery({
    queryKey: ["learning-lesson-videos", modules.map(m => m.id).join(',')],
    queryFn: async () => {
      const moduleIds = modules.map(m => m.id);
      
      // Obter todas as lições dos módulos
      const { data: lessonsData } = await supabase
        .from("learning_lessons")
        .select("id, module_id")
        .in("module_id", moduleIds)
        .eq("published", true);
        
      if (!lessonsData?.length) return {};
      
      const lessonIds = lessonsData.map(l => l.id);
      
      // Buscar vídeos das lições
      const { data: videos, error } = await supabase
        .from("learning_lesson_videos")
        .select("*")
        .in("lesson_id", lessonIds)
        .order("order_index", { ascending: true });
        
      if (error) {
        console.error("Erro ao carregar vídeos das aulas:", error);
        return {};
      }
      
      // Agrupar vídeos por lição
      const videosByLesson: Record<string, any[]> = {};
      
      videos.forEach(video => {
        if (!videosByLesson[video.lesson_id]) {
          videosByLesson[video.lesson_id] = [];
        }
        videosByLesson[video.lesson_id].push(video);
      });
      
      return videosByLesson;
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

  // Função para calcular progresso do curso
  const calculateCourseProgress = (progressList: any[]): number => {
    if (!progressList || progressList.length === 0) return 0;
    
    const completedLessons = progressList.filter(p => p.completed_at).length;
    const totalLessons = progressList.length;
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };
  
  // Calcular a duração total de um módulo em minutos
  const calculateModuleDuration = (moduleId: string): number => {
    if (!lessonVideos || !moduleLessons || !moduleLessons[moduleId]) return 0;
    
    const lessons = moduleLessons[moduleId];
    let totalDuration = 0;
    
    lessons.forEach(lesson => {
      const videos = lessonVideos[lesson.id] || [];
      videos.forEach(video => {
        if (video.duration_seconds) {
          totalDuration += Math.ceil(video.duration_seconds / 60);
        } else if (lesson.estimated_time_minutes) {
          totalDuration += lesson.estimated_time_minutes;
        }
      });
      
      // Se não há vídeos mas há tempo estimado na aula
      if (videos.length === 0 && lesson.estimated_time_minutes) {
        totalDuration += lesson.estimated_time_minutes;
      }
    });
    
    return totalDuration;
  };
  
  // Contar o número total de vídeos em um módulo
  const countModuleVideos = (moduleId: string): number => {
    if (!lessonVideos || !moduleLessons || !moduleLessons[moduleId]) return 0;
    
    const lessons = moduleLessons[moduleId];
    let totalVideos = 0;
    
    lessons.forEach(lesson => {
      const videos = lessonVideos[lesson.id] || [];
      totalVideos += videos.length;
    });
    
    return totalVideos;
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
                {modules.map((module) => {
                  const isCompleted = isModuleCompleted(module.id);
                  const progress = calculateModuleProgress(module.id);
                  const duration = calculateModuleDuration(module.id);
                  const videoCount = countModuleVideos(module.id);
                  
                  return (
                    <AccordionItem key={module.id} value={module.id} className="border-b">
                      <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                        <div className="flex flex-col items-start text-left w-full">
                          <div className="flex items-center gap-2 w-full justify-between">
                            <span className="font-medium">{module.title}</span>
                            {isCompleted && (
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                            <span>
                              {moduleLessons && moduleLessons[module.id] 
                                ? `${moduleLessons[module.id].length} aulas`
                                : "0 aulas"}
                            </span>
                            
                            {videoCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                {videoCount} {videoCount === 1 ? 'vídeo' : 'vídeos'}
                              </span>
                            )}
                            
                            {duration > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {duration} min
                              </span>
                            )}
                            
                            {progress > 0 && (
                              <span>{progress}% concluído</span>
                            )}
                          </div>
                          
                          {progress > 0 && (
                            <div className="w-full mt-2 bg-muted rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-primary h-full" 
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}
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
                                videos={lessonVideos?.[lesson.id] || []}
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
                  );
                })}
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
          progressPercentage={calculateCourseProgress(userProgress)}
        />
      </TabsContent>
    </Tabs>
  );
};
