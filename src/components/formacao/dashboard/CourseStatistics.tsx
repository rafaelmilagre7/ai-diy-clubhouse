
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  LearningCourse, 
  LearningModule,
  LearningLesson 
} from "@/lib/supabase";
import { Users, Clock, BookOpen, Video, Award } from "lucide-react";

interface CourseStatisticsProps {
  course: LearningCourse;
  modules: LearningModule[];
  totalLessons: number;
  totalVideos: number;
  totalStudents: number;
  completionRate: number;
}

export const CourseStatistics = ({
  course,
  modules,
  totalLessons,
  totalVideos,
  totalStudents,
  completionRate
}: CourseStatisticsProps) => {
  // Calcular estatísticas - usar is_published se existir, senão assumir published
  const publishedModules = modules.filter(m => m.is_published ?? true).length;
  const moduleCompletionRate = modules.length > 0 
    ? Math.round((publishedModules / modules.length) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total de Estudantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Users className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-2xl font-bold">{totalStudents}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Módulos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-2xl font-bold">{modules.length}</span>
            <span className="text-xs text-muted-foreground ml-2">
              ({publishedModules} publicados)
            </span>
          </div>
          <Progress className="mt-2" value={moduleCompletionRate} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Aulas e Vídeos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-xl font-bold">{totalLessons}</span>
              <span className="text-xs ml-1">aulas</span>
            </div>
            <div className="flex items-center">
              <Video className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-xl font-bold">{totalVideos}</span>
              <span className="text-xs ml-1">vídeos</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Award className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-2xl font-bold">{completionRate}%</span>
          </div>
          <Progress className="mt-2" value={completionRate} />
        </CardContent>
      </Card>
    </div>
  );
};
