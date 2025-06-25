
import React from "react";
import { Link } from "react-router-dom";
import { LearningCourse, LearningProgress } from "@/lib/supabase/types";
import { CourseCard } from "./CourseCard";
import { EmptyCoursesState } from "./EmptyCoursesState";

interface MemberCoursesListProps {
  courses: LearningCourse[];
  userProgress: LearningProgress[];
}

export const MemberCoursesList: React.FC<MemberCoursesListProps> = ({
  courses,
  userProgress
}) => {
  if (!courses || courses.length === 0) {
    return <EmptyCoursesState activeTab="all" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => {
        // Calcular progresso do usuário para este curso
        const courseProgress = userProgress.filter(p => {
          // Buscar progresso por lesson_id que pertence a este curso
          // Vamos usar o campo lesson_count do curso para calcular o total
          return course.all_lessons?.some(lesson => lesson.id === p.lesson_id);
        });
        
        const completedLessons = courseProgress.filter(p => 
          p.progress_percentage >= 100
        ).length;
        
        const totalLessons = course.lesson_count || 0;
        const progressPercentage = totalLessons > 0 
          ? Math.round((completedLessons / totalLessons) * 100) 
          : 0;

        return (
          <Link 
            key={course.id} 
            to={`/learning/course/${course.id}`}
            className="block"
          >
            <CourseCard
              id={course.id}
              title={course.title}
              description={course.description || ""}
              imageUrl={course.cover_image_url || undefined}
              progress={progressPercentage}
              moduleCount={course.module_count}
              lessonCount={totalLessons}
            />
          </Link>
        );
      })}
    </div>
  );
};
