
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, Users, MessageSquare } from 'lucide-react';
import { LearningLesson } from '@/lib/supabase';
import { safeJsonParseObject } from '@/lib/supabase';

interface AulaDetailsProps {
  aula: LearningLesson;
}

const AulaDetails = ({ aula }: AulaDetailsProps) => {
  // Parse seguro do conteúdo JSON
  const content = safeJsonParseObject(aula.content, {});
  // Use estimated_duration_minutes que existe no schema
  const estimatedTime = aula.estimated_duration_minutes || content.estimatedTime || 0;
  
  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'Iniciante';
      case 'intermediate':
        return 'Intermediário';
      case 'advanced':
        return 'Avançado';
      default:
        return 'Indefinido';
    }
  };

  // Use difficulty_level que existe no schema
  const difficultyLevel = aula.difficulty_level || 'beginner';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{aula.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                className={getDifficultyColor(difficultyLevel)}
                variant="secondary"
              >
                {getDifficultyLabel(difficultyLevel)}
              </Badge>
              {/* Use is_published que existe no schema */}
              <Badge variant={aula.is_published ? "default" : "secondary"}>
                {aula.is_published ? "Publicada" : "Rascunho"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {aula.description && (
            <div>
              <h4 className="font-medium mb-2">Descrição</h4>
              <p className="text-gray-600">{aula.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{estimatedTime || 0} min</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Eye className="h-4 w-4" />
              <span>0 visualizações</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>0 alunos</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MessageSquare className="h-4 w-4" />
              <span>0 comentários</span>
            </div>
          </div>

          {/* Use ai_assistant_id que existe no schema */}
          {aula.ai_assistant_id && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">Assistente de IA Ativo</h4>
              <p className="text-sm text-blue-700">
                ID: {aula.ai_assistant_id}
              </p>
              {/* Use ai_assistant_prompt que existe no schema */}
              {aula.ai_assistant_prompt && (
                <p className="text-sm text-blue-600 mt-2">
                  Prompt: {aula.ai_assistant_prompt}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AulaDetails;
