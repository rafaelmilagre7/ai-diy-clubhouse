
import { useMemo } from "react";
import { LearningModule, LearningProgress } from "@/lib/supabase/types";
import { LearningLessonWithRelations } from "@/lib/supabase/types/extended";

interface CourseStatsProps {
  modules?: LearningModule[];
  allLessons?: LearningLessonWithRelations[];
  userProgress?: LearningProgress[];
}

export function useCourseStats({ modules, allLessons, userProgress }: CourseStatsProps) {
  
  // Calcular estatísticas do curso
  const courseStats = useMemo(() => {
    if (!allLessons) return {};
    
    let totalVideos = 0;
    let totalDuration = 0;
    
    allLessons.forEach(lesson => {
      if (lesson.videos && Array.isArray(lesson.videos)) {
        totalVideos += lesson.videos.length;
        
        lesson.videos.forEach(video => {
          if (video.duration_seconds) {
            totalDuration += video.duration_seconds;
          }
        });
      }
    });
    
    return {
      moduleCount: modules?.length || 0,
      lessonCount: allLessons.length,
      videoCount: totalVideos,
      durationMinutes: Math.ceil(totalDuration / 60)
    };
  }, [allLessons, modules]);
  
  // Obter ID da primeira aula (para o botão de iniciar curso)
  const firstLessonId = useMemo(() => {
    if (!allLessons || allLessons.length === 0) return null;
    return allLessons[0].id;
  }, [allLessons]);
  
  // Calcular progresso do curso
  const courseProgress = useMemo(() => {
    if (!allLessons || !userProgress || allLessons.length === 0) return 0;
    
    // Extrair IDs de todas as lições do curso
    const allLessonIds = allLessons.map(lesson => lesson.id);
    
    // Contar lições completadas
    let completedLessons = 0;
    if (userProgress) {
      userProgress.forEach(progress => {
        if (allLessonIds.includes(progress.lesson_id) && progress.progress_percentage === 100) {
          completedLessons++;
        }
      });
    }
    
    return Math.round((completedLessons / allLessonIds.length) * 100);
  }, [allLessons, userProgress]);

  return {
    courseStats,
    firstLessonId,
    courseProgress
  };
}
