
import React from "react";
import { LearningLesson } from "@/lib/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, BookOpen, Play, Eye, EyeOff } from "lucide-react";

interface AulaDetailsProps {
  lesson: LearningLesson;
  isExpanded?: boolean;
  onClick?: () => void;
}

// Helper function to safely handle JSON data
const safeJsonAccess = (data: any, fallback: any = null) => {
  if (!data) return fallback;
  if (typeof data === 'object') return data;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

// Helper function to safely get array length
const safeArrayLength = (data: any): number => {
  const parsed = safeJsonAccess(data, []);
  return Array.isArray(parsed) ? parsed.length : 0;
};

// Helper function to safely get course info
const getCourseInfo = (moduleData: any) => {
  const module = safeJsonAccess(moduleData);
  if (module && module.course) {
    return {
      course_id: module.course.id || module.course_id,
      course_title: module.course.title || 'Curso sem título'
    };
  }
  return null;
};

export const AulaDetails: React.FC<AulaDetailsProps> = ({ 
  lesson, 
  isExpanded = false, 
  onClick 
}) => {
  const courseInfo = getCourseInfo(lesson.module);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return level;
    }
  };

  return (
    <Card 
      className={`transition-all duration-300 cursor-pointer hover:shadow-md ${
        isExpanded ? 'ring-2 ring-viverblue' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">
              {lesson.title}
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {courseInfo && (
                <Badge variant="outline" className="text-xs">
                  {courseInfo.course_title}
                </Badge>
              )}
              
              <Badge 
                variant="outline" 
                className={`text-xs ${getDifficultyColor(lesson.difficulty_level || 'beginner')}`}
              >
                {getDifficultyLabel(lesson.difficulty_level || 'beginner')}
              </Badge>
              
              <div className="flex items-center gap-1">
                {lesson.published ? (
                  <Eye className="h-3 w-3 text-green-600" />
                ) : (
                  <EyeOff className="h-3 w-3 text-gray-400" />
                )}
                <span className="text-xs">
                  {lesson.published ? 'Publicada' : 'Rascunho'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {lesson.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {lesson.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Clock className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">Duração</span>
            <span className="text-sm font-medium">
              {lesson.estimated_time_minutes || 0} min
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <Play className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">Vídeos</span>
            <span className="text-sm font-medium">
              {safeArrayLength((lesson as any).videos)}
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <BookOpen className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">Recursos</span>
            <span className="text-sm font-medium">
              {safeArrayLength((lesson as any).resources)}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Criada em:</span>
                <span>{new Date(lesson.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Última atualização:</span>
                <span>{new Date(lesson.updated_at).toLocaleDateString('pt-BR')}</span>
              </div>
              
              {lesson.ai_assistant_enabled && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">IA Assistente:</span>
                  <Badge variant="secondary" className="text-xs">
                    Ativado
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
