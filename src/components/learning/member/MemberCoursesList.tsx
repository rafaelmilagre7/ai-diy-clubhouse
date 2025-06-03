
import React from "react";
import { CourseCard } from "./CourseCard";
import { CoursesSkeleton } from "./CoursesSkeleton";
import { EmptyCoursesState } from "./states/EmptyCoursesState";
import { LearningCourseWithStats, LearningProgress } from "@/lib/supabase/types";
import { ensureNumber, ensureArray } from "@/lib/supabase/types/utils";

interface MemberCoursesListProps {
  courses?: LearningCourseWithStats[];
  userProgress?: LearningProgress[];
  isLoading?: boolean;
}

// Função para calcular o progresso do curso com validação defensiva
const calculateCourseProgress = (course: LearningCourseWithStats, userProgress: LearningProgress[]): number => {
  // Validação defensiva das lessons
  const lessons = ensureArray(course.all_lessons);
  if (lessons.length === 0) {
    return 0;
  }

  // Contar quantas aulas estão concluídas (100% de progresso)
  const completedLessons = lessons.filter(lesson => {
    const lessonProgress = userProgress.find(p => p.lesson_id === lesson.id);
    return lessonProgress && lessonProgress.progress_percentage >= 100;
  });

  // Calcular percentual de conclusão
  return Math.round((completedLessons.length / lessons.length) * 100);
};

export const MemberCoursesList: React.FC<MemberCoursesListProps> = ({
  courses = [],
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
            moduleCount={ensureNumber(course.module_count)}
            lessonCount={ensureNumber(course.lesson_count)}
          />
        );
      })}
    </div>
  );
};
