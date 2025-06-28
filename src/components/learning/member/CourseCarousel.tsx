
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningCourse } from '@/lib/supabase';
import { safeJsonParseObject } from '@/utils/jsonUtils';

interface CourseCarouselProps {
  courses: LearningCourse[];
  onCourseClick: (course: LearningCourse) => void;
}

export const CourseCarousel = ({ courses, onCourseClick }: CourseCarouselProps) => {
  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum curso disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => {
        const courseData = safeJsonParseObject(course, course);
        
        return (
          <Card 
            key={course.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 group"
            onClick={() => onCourseClick(course)}
          >
            <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
              <span className="text-white font-semibold">{course.title}</span>
            </div>
            
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                {/* Corrigido: usar published baseado no schema real */}
                <Badge variant={course.published ? "default" : "secondary"}>
                  {course.published ? "Disponível" : "Em breve"}
                </Badge>
                {courseData.module_count && (
                  <span className="text-sm text-muted-foreground">
                    {courseData.module_count} módulos
                  </span>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                    {course.description}
                  </p>
                )}
              </div>
              
              {courseData.lesson_count && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{courseData.lesson_count} aulas</span>
                  {courseData.is_restricted && (
                    <Badge variant="outline" className="text-xs">
                      Restrito
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
