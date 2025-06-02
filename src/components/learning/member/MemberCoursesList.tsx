
import React from 'react';
import { CourseCard } from './CourseCard';
import { ContinueLearning } from './ContinueLearning';
import { LearningCourseWithLessons } from '@/lib/supabase/types/learning';
import { LearningProgress } from '@/lib/supabase/types';
import { Skeleton } from '@/components/ui/skeleton';

interface MemberCoursesListProps {
  courses: LearningCourseWithLessons[];
  userProgress: LearningProgress[];
  isLoading: boolean;
}

export const MemberCoursesList: React.FC<MemberCoursesListProps> = ({
  courses,
  userProgress,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Nenhum curso disponível
        </h3>
        <p className="text-sm text-muted-foreground">
          Os cursos serão disponibilizados em breve.
        </p>
      </div>
    );
  }

  // Calcular progresso dos cursos
  const coursesWithProgress = courses.map(course => {
    const totalLessons = course.lesson_count || 0;
    if (totalLessons === 0) return { ...course, progress: 0, nextLessonId: null };

    // Buscar progresso das aulas deste curso
    const courseProgress = userProgress.filter(progress => 
      course.all_lessons?.some(lesson => lesson.id === progress.lesson_id)
    );
    
    const completedLessons = courseProgress.filter(p => p.progress_percentage >= 100).length;
    const progress = Math.round((completedLessons / totalLessons) * 100);
    
    // Encontrar próxima aula (primeira não concluída)
    const nextLesson = course.all_lessons?.find(lesson => 
      !courseProgress.some(p => p.lesson_id === lesson.id && p.progress_percentage >= 100)
    );
    
    return { 
      ...course, 
      progress,
      nextLessonId: nextLesson?.id || null
    };
  });

  // Encontrar curso em andamento para o banner
  const courseInProgress = coursesWithProgress.find(course => 
    course.progress > 0 && course.progress < 100
  );

  return (
    <div className="space-y-8">
      {/* Banner de Continuar Aprendizado */}
      {courseInProgress && (
        <ContinueLearning 
          course={courseInProgress}
          progress={courseInProgress.progress}
          nextLessonId={courseInProgress.nextLessonId}
        />
      )}
      
      {/* Grade de Cursos */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Todos os Cursos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesWithProgress.map((course) => (
            <CourseCard
              key={course.id}
              courseId={course.id}
              title={course.title}
              description={course.description || ''}
              imageUrl={course.cover_image_url}
              progress={course.progress}
              moduleCount={course.module_count}
              lessonCount={course.lesson_count}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
