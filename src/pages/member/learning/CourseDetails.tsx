
import React from "react";
import { useParams } from "react-router-dom";
import { useCourseDetails } from "@/hooks/learning/useCourseDetails";
import { CourseDetailsSkeleton } from "@/components/learning/member/CourseDetailsSkeleton";
import { CourseHeader } from "@/components/learning/member/CourseHeader";
import { CourseModules } from "@/components/learning/member/CourseModules";
import { AccessDenied } from "@/components/learning/member/AccessDenied";

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const { course, modules, allLessons, userProgress, isLoading, accessDenied } = useCourseDetails(id);

  if (isLoading) {
    return <CourseDetailsSkeleton />;
  }

  if (accessDenied) {
    return <AccessDenied />;
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Curso não encontrado</h2>
          <p className="text-muted-foreground">O curso solicitado não existe ou não está disponível.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CourseHeader courseId={course.id} course={course} />
      
      <CourseModules 
        modules={modules || []}
        userProgress={userProgress || []}
        courseId={course.id}
        course={course}
      />
    </div>
  );
}
