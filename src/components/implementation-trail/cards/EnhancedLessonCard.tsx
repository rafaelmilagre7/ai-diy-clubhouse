import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Clock, Users, ExternalLink } from 'lucide-react';
import { APP_CONFIG } from '@/config/app';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  members_quantity: number;
  is_free: boolean;
}

interface Progress {
  completed_lessons: number;
  total_lessons: number;
}

interface EnhancedLessonCardProps {
  lesson: Lesson;
  onStart: (lessonId: string) => void;
  progress?: Progress;
  isLocked?: boolean;
}

export const EnhancedLessonCard = ({ lesson, onStart, progress, isLocked }: EnhancedLessonCardProps) => {
  const progressPercentage = progress ? (progress.completed_lessons / progress.total_lessons) * 100 : 0;
  const isCompleted = progressPercentage === 100;
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: lesson.title,
          text: lesson.description,
          url: `${APP_CONFIG.getAppUrl()}/lessons/${lesson.id}` // CORRIGIDO: sem argumentos
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para navegadores que não suportam Web Share API
      const url = `${APP_CONFIG.getAppUrl()}/lessons/${lesson.id}`; // CORRIGIDO: sem argumentos
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{lesson.title}</CardTitle>
          {isCompleted && <Badge variant="secondary">Concluído</Badge>}
        </div>
        <CardDescription>{lesson.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{lesson.duration} minutos</span>
          <Users className="h-4 w-4 ml-4" />
          <span>{lesson.members_quantity}+ membros</span>
        </div>
        <div className="flex items-center justify-between">
          {lesson.is_free ? (
            <Badge variant="outline">Grátis</Badge>
          ) : (
            <Badge>Premium</Badge>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleShare}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            <Button size="sm" onClick={() => onStart(lesson.id)} disabled={isLocked}>
              <Play className="h-4 w-4 mr-2" />
              {isLocked ? 'Bloqueado' : 'Começar'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
