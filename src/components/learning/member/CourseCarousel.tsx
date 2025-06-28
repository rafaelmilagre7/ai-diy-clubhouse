
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
        // CORREÇÃO: Parse seguro de dados JSON se necessário
        const courseData = safeJsonParseObject(course, course);
        
        return (
          <Card 
            key={course.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 group"
            onClick={() => onCourseClick(course)}
          >
            {/* Corrigido: usar cover_image_url que existe no schema */}
            {course.cover_image_url && (
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img 
                  src={course.cover_image_url} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            )}
            
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                {/* Corrigido: usar published que existe no schema */}
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
