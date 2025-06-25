
import React from "react";
import { Link } from "react-router-dom";
import { LearningCourse, LearningProgress } from "@/lib/supabase/types";
import { CourseCard } from "./CourseCard";
import { EmptyCoursesState } from "./states/EmptyCoursesState";

interface MemberCoursesListProps {
  courses: LearningCourse[];
  userProgress: LearningProgress[];
}

export const MemberCoursesList: React.FC<MemberCoursesListProps> = ({
  courses,
  userProgress
}) => {
  if (!courses || courses.length === 0) {
    return <EmptyCoursesState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => {
        // Calcular progresso do usuário para este curso
        const courseProgress = userProgress.filter(p => 
          p.course_id === course.id
        );
        
        const completedLessons = courseProgress.filter(p => 
          p.progress_percentage >= 100
        ).length;
        
        const totalLessons = course.total_lessons || 0;
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
              course={course}
              progress={progressPercentage}
              completedLessons={completedLessons}
              totalLessons={totalLessons}
            />
          </Link>
        );
      })}
    </div>
  );
};
