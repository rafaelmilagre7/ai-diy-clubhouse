
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, Clock, BookOpen, ArrowRight } from "lucide-react";
import { TrailLessonEnriched } from "@/types/implementation-trail";
import { useNavigate } from "react-router-dom";

interface TrailLessonsListProps {
  lessons: TrailLessonEnriched[];
}

export const TrailLessonsList: React.FC<TrailLessonsListProps> = ({ lessons }) => {
  const navigate = useNavigate();

  if (!lessons || lessons.length === 0) {
    return (
      <Card className="bg-neutral-900/50 border-neutral-700/50">
        <CardContent className="py-8 text-center">
          <p className="text-neutral-400">Nenhuma aula encontrada na trilha</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {lessons.map((lesson) => (
        <Card 
          key={lesson.id} 
          className="bg-neutral-900/50 border-neutral-700/50 hover:border-viverblue/30 transition-all duration-200 cursor-pointer group"
          onClick={() => navigate(`/learning/course/${lesson.module.course.id}/lesson/${lesson.id}`)}
        >
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-viverblue/20">
                <PlayCircle className="h-5 w-5 text-viverblue" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-white group-hover:text-viverblue transition-colors line-clamp-2">
                  {lesson.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2 text-sm text-neutral-400">
                  <BookOpen className="h-4 w-4" />
                  <span>{lesson.module.course.title}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Thumbnail da aula */}
            {lesson.cover_image_url && (
              <div className="aspect-video rounded-lg overflow-hidden bg-neutral-800">
                <img 
                  src={lesson.cover_image_url} 
                  alt={lesson.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Descrição */}
            {lesson.description && (
              <p className="text-sm text-neutral-400 line-clamp-2">
                {lesson.description}
              </p>
            )}
            
            {/* Justificativa da IA */}
            {lesson.justification && (
              <div className="bg-viverblue/10 border border-viverblue/20 rounded-lg p-3">
                <p className="text-xs text-viverblue font-medium mb-1">
                  💡 Por que esta aula:
                </p>
                <p className="text-xs text-neutral-300">
                  {lesson.justification}
                </p>
              </div>
            )}
            
            {/* Metadados */}
            <div className="flex flex-wrap gap-2 items-center">
              {lesson.estimated_time_minutes && (
                <Badge variant="outline" className="text-xs border-neutral-600 text-neutral-300">
                  <Clock className="h-3 w-3 mr-1" />
                  {lesson.estimated_time_minutes}min
                </Badge>
              )}
              {lesson.difficulty_level && (
                <Badge variant="outline" className="text-xs border-neutral-600 text-neutral-300">
                  {lesson.difficulty_level}
                </Badge>
              )}
            </div>
            
            {/* Breadcrumb do curso */}
            <div className="text-xs text-neutral-500">
              {lesson.module.course.title} → {lesson.module.title}
            </div>
            
            {/* Botão de ação */}
            <Button 
              className="w-full bg-viverblue hover:bg-viverblue/90 text-white"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/learning/course/${lesson.module.course.id}/lesson/${lesson.id}`);
              }}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Assistir Aula
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
