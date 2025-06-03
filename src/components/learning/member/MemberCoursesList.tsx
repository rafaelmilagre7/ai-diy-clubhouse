
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LearningCourse } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Book, Clock, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface MemberCoursesListProps {
  courses: LearningCourse[];
  userProgress: any[];
}

export const MemberCoursesList = ({ courses, userProgress }: MemberCoursesListProps) => {
  // Buscar módulos e aulas para todos os cursos para exibir estatísticas
  const { data: courseStats } = useQuery({
    queryKey: ["learning-courses-stats", courses.map(c => c.id).join(',')],
    queryFn: async () => {
      const courseIds = courses.map(c => c.id);
      if (!courseIds.length) return {};
      
      // Obter todos os módulos dos cursos
      const { data: modules } = await supabase
        .from("learning_modules")
        .select("id, course_id")
        .in("course_id", courseIds)
        .eq("published", true);
      
      if (!modules?.length) return {};
      
      // Obter todas as aulas dos módulos
      const moduleIds = modules.map(m => m.id);
      const { data: lessons } = await supabase
        .from("learning_lessons")
        .select("id, module_id")
        .in("module_id", moduleIds)
        .eq("published", true);
      
      // Obter todos os vídeos das aulas
      const lessonIds = lessons?.map(l => l.id) || [];
      const { data: videos } = await supabase
        .from("learning_lesson_videos")
        .select("lesson_id, duration_seconds")
        .in("lesson_id", lessonIds);
      
      // Calcular estatísticas por curso
      const stats: Record<string, { lessonCount: number, videoCount: number, totalMinutes: number }> = {};
      
      courseIds.forEach(courseId => {
        stats[courseId] = { lessonCount: 0, videoCount: 0, totalMinutes: 0 };
      });
      
      // Agrupar módulos por curso
      const modulesByCourse: Record<string, string[]> = {};
      modules?.forEach(module => {
        if (!modulesByCourse[module.course_id]) {
          modulesByCourse[module.course_id] = [];
        }
        modulesByCourse[module.course_id].push(module.id);
      });
      
      // Contar aulas por módulo
      lessons?.forEach(lesson => {
        const courseId = Object.entries(modulesByCourse).find(
          ([, moduleIds]) => moduleIds.includes(lesson.module_id)
        )?.[0];
        
        if (courseId) {
          stats[courseId].lessonCount += 1;
        }
      });
      
      // Contar vídeos e duração
      videos?.forEach(video => {
        const lesson = lessons?.find(l => l.id === video.lesson_id);
        if (lesson) {
          const courseId = Object.entries(modulesByCourse).find(
            ([, moduleIds]) => moduleIds.includes(lesson.module_id)
          )?.[0];
          
          if (courseId) {
            stats[courseId].videoCount += 1;
            
            // Calcular minutos (se houver duração disponível)
            if (video.duration_seconds) {
              stats[courseId].totalMinutes += Math.ceil(video.duration_seconds / 60);
            }
          }
        }
      });
      
      return stats;
    },
    enabled: courses.length > 0
  });

  // Função para calcular progresso do curso para o usuário
  const calculateCourseProgress = (courseId: string): number => {
    if (!userProgress || userProgress.length === 0) return 0;
    
    const courseProgress = userProgress.filter(p => {
      // Verificar se o progresso pertence a uma aula do curso atual
      return p.lesson && p.lesson.module && p.lesson.module.course_id === courseId;
    });
    
    if (courseProgress.length === 0) return 0;
    
    const completedLessons = courseProgress.filter(p => p.completed_at).length;
    return Math.round((completedLessons / courseProgress.length) * 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => {
        const progress = calculateCourseProgress(course.id);
        const stats = courseStats?.[course.id];
        
        return (
          <Card key={course.id} className="overflow-hidden flex flex-col">
            {course.cover_image_url ? (
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={course.cover_image_url} 
                  alt={course.title}
                  className="h-full w-full object-cover" 
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-muted flex items-center justify-center">
                <Book className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="line-clamp-2">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">{course.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="flex-grow">
              <div className="flex flex-wrap gap-2 mt-2">
                {stats?.lessonCount > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Book className="h-3 w-3" />
                    {stats.lessonCount} {stats.lessonCount === 1 ? 'aula' : 'aulas'}
                  </Badge>
                )}
                
                {stats?.videoCount > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    {stats.videoCount} {stats.videoCount === 1 ? 'vídeo' : 'vídeos'}
                  </Badge>
                )}
                
                {stats?.totalMinutes > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {stats.totalMinutes} min
                  </Badge>
                )}
              </div>
              
              {progress > 0 && (
                <div className="mt-4 border border-border rounded-full h-2 overflow-hidden bg-muted">
                  <div 
                    className="h-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button asChild className="w-full">
                <Link to={`/learning/course/${course.id}`}>
                  {progress > 0 ? 'Continuar curso' : 'Iniciar curso'}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
