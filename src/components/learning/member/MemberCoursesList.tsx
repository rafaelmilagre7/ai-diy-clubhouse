
import React from "react";
import { CourseCard } from "./CourseCard";
import { CoursesSkeleton } from "./CoursesSkeleton";
import { EmptyCoursesState } from "./EmptyCoursesState";
import { LearningProgress } from "@/lib/supabase";
import { LearningCourseWithLessons } from "@/lib/supabase/types/learning";

interface MemberCoursesListProps {
  courses: LearningCourseWithLessons[];
  userProgress: LearningProgress[];
  isLoading?: boolean;
}

// Função para calcular o progresso do curso
const calculateCourseProgress = (course: LearningCourseWithLessons, userProgress: LearningProgress[]): number => {
  // Se o curso não tem aulas, consideramos 0%
  if (!course.all_lessons || course.all_lessons.length === 0) {
    return 0;
  }

  // Contar quantas aulas estão concluídas (100% de progresso)
  const completedLessons = course.all_lessons.filter(lesson => {
    const lessonProgress = userProgress.find(p => p.lesson_id === lesson.id);
    return lessonProgress && lessonProgress.progress_percentage >= 100;
  });

  // Calcular percentual de conclusão
  const progressPercentage = Math.round((completedLessons.length / course.all_lessons.length) * 100);
  
  return progressPercentage;
};

export const MemberCoursesList: React.FC<MemberCoursesListProps> = ({
  courses,
  userProgress = [],
  isLoading = false
}) => {
  if (isLoading) {
    return <CoursesSkeleton />;
  }

  if (!courses || courses.length === 0) {
    return <EmptyCoursesState activeTab="all" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => {
        const progress = calculateCourseProgress(course, userProgress);
        
        return (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            description={course.description || ""}
            imageUrl={course.cover_image_url}
            progress={progress}
            moduleCount={course.module_count}
            lessonCount={course.lesson_count}
          />
        );
      })}
    </div>
  );
};
