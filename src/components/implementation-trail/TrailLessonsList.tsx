
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { TrailLessonEnriched } from "@/types/implementation-trail";
import { PlayCircle, Clock, BookOpen, ArrowRight } from "lucide-react";

interface TrailLessonsListProps {
  lessons: TrailLessonEnriched[];
}

export const TrailLessonsList: React.FC<TrailLessonsListProps> = ({ lessons }) => {
  const navigate = useNavigate();

  if (!lessons || lessons.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400">
        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Nenhuma aula recomendada encontrada</p>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/50';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {lessons.map((lesson) => (
        <Card key={lesson.id} className="bg-neutral-900/50 border-neutral-700/50 hover:border-viverblue/50 transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-white line-clamp-2 mb-2">
                  {lesson.title}
                </CardTitle>
                
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <BookOpen className="h-4 w-4" />
                  <span>{lesson.module.course.title}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                  <span>Módulo: {lesson.module.title}</span>
                </div>
              </div>
              
              <PlayCircle className="h-6 w-6 text-viverblue flex-shrink-0" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {lesson.cover_image_url && (
              <div className="aspect-video bg-neutral-800 rounded-lg overflow-hidden">
                <img
                  src={lesson.cover_image_url}
                  alt={lesson.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {lesson.description && (
              <p className="text-sm text-neutral-300 line-clamp-3">
                {lesson.description}
              </p>
            )}

            {lesson.justification && (
              <div className="bg-viverblue/10 border border-viverblue/20 rounded-lg p-3">
                <p className="text-sm text-viverblue font-medium">
                  🎯 Recomendado para você:
                </p>
                <p className="text-sm text-neutral-300 mt-1">
                  {lesson.justification}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {lesson.difficulty_level && (
                <Badge className={getDifficultyColor(lesson.difficulty_level)}>
                  {lesson.difficulty_level}
                </Badge>
              )}
              
              {lesson.estimated_time_minutes && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(lesson.estimated_time_minutes)}
                </Badge>
              )}
            </div>

            <Button
              onClick={() => navigate(`/learning/lesson/${lesson.id}`)}
              className="w-full bg-viverblue hover:bg-viverblue/90 text-white"
            >
              Assistir Aula
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
