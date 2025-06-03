
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, BookOpen } from "lucide-react";

interface CourseHeaderProps {
  courseId: string;
  course: {
    id: string;
    title: string;
    description?: string;
    cover_image_url?: string;
    duration_hours?: number;
    published: boolean;
  };
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  return (
    <div className="space-y-6">
      <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
        {course.cover_image_url ? (
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${course.cover_image_url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-slate-700" />
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
          {course.description && (
            <p className="mt-2 line-clamp-2 text-white/80">{course.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>{course.duration_hours || 0}h</span>
        </div>
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4" />
          <span>0 alunos</span>
        </div>
        <div className="flex items-center space-x-1">
          <BookOpen className="w-4 h-4" />
          <span>Curso</span>
        </div>
        {course.published && (
          <Badge variant="secondary">Publicado</Badge>
        )}
      </div>
    </div>
  );
};
