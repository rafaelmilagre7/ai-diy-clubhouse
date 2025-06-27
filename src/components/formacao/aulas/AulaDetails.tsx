
import React from 'react';
import { LearningLesson, LearningLessonVideo, LearningResource } from '@/lib/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Play, FileText, Edit } from 'lucide-react';

interface AulaDetailsProps {
  lesson: LearningLesson;
  videos: LearningLessonVideo[];
  resources: LearningResource[];
  onEdit?: () => void;
}

// Helper function to safely extract data from JSON
const safeGetFromJson = (json: any, key: string): any => {
  if (!json) return null;
  if (typeof json === 'object' && json[key] !== undefined) {
    return json[key];
  }
  return null;
};

// Helper function to safely get array length from JSON
const safeGetArrayLength = (json: any): number => {
  if (!json) return 0;
  if (Array.isArray(json)) return json.length;
  if (typeof json === 'object' && json.length !== undefined) return json.length;
  return 0;
};

// Helper function to safely map over JSON array
const safeMapJson = (json: any, callback: (item: any, index: number) => any): any[] => {
  if (!json) return [];
  if (Array.isArray(json)) return json.map(callback);
  return [];
};

export const AulaDetails: React.FC<AulaDetailsProps> = ({
  lesson,
  videos,
  resources,
  onEdit
}) => {
  // Safely extract module information
  const moduleTitle = safeGetFromJson(lesson.module, 'title') || 'Módulo';
  const courseName = safeGetFromJson(lesson.module, 'course_id') || 'Curso';

  // Get difficulty label
  const getDifficultyLabel = (level: string | null) => {
    switch (level) {
      case 'beginner':
        return 'Iniciante';
      case 'intermediate':
        return 'Intermediário';
      case 'advanced':
        return 'Avançado';
      default:
        return 'Não definido';
    }
  };

  // Get difficulty color
  const getDifficultyColor = (level: string | null) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{moduleTitle}</span>
            <span>•</span>
            <span>{courseName}</span>
          </div>
        </div>
        {onEdit && (
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      {/* Lesson Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Aula</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lesson.description && (
            <div>
              <h4 className="font-medium mb-2">Descrição</h4>
              <p className="text-muted-foreground">{lesson.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {lesson.estimated_time_minutes || 0} minutos
              </span>
            </div>

            <div>
              <Badge 
                variant="outline" 
                className={getDifficultyColor(lesson.difficulty_level)}
              >
                {getDifficultyLabel(lesson.difficulty_level)}
              </Badge>
            </div>

            <div>
              <Badge variant={lesson.published ? "default" : "secondary"}>
                {lesson.published ? "Publicada" : "Rascunho"}
              </Badge>
            </div>
          </div>

          {lesson.ai_assistant_enabled && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-900">
                  Assistente de IA habilitado
                </span>
              </div>
              {lesson.ai_assistant_id && (
                <p className="text-xs text-blue-700 mt-1">
                  ID: {lesson.ai_assistant_id}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Videos */}
      {videos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Vídeos ({videos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {videos.map((video, index) => (
                <div key={video.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex-1">
                    <h5 className="font-medium">{video.title}</h5>
                    {video.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {video.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Tipo: {video.video_type || 'YouTube'}</span>
                      {video.duration_seconds && (
                        <span>
                          Duração: {Math.ceil(video.duration_seconds / 60)} min
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recursos ({resources.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resources.map((resource, index) => (
                <div key={resource.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex-1">
                    <h5 className="font-medium">{resource.name}</h5>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {resource.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Tipo: {resource.file_type || 'Arquivo'}</span>
                      {resource.file_size_bytes && (
                        <span>
                          Tamanho: {Math.ceil(resource.file_size_bytes / 1024)}KB
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AulaDetails;
