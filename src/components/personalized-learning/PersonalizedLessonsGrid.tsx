import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useFeatureAccess } from '@/hooks/auth/useFeatureAccess';
import { usePremiumUpgradeModal } from '@/hooks/usePremiumUpgradeModal';
import { 
  PlayCircle, 
  Clock, 
  Star, 
  ArrowRight, 
  BookOpen,
  Target,
  Brain,
  TrendingUp
} from 'lucide-react';
import { RecommendedLesson } from '@/types/implementationTrail';

interface PersonalizedLessonsGridProps {
  lessons: (RecommendedLesson & { 
    personalizationScore?: number;
    connects_to_solutions?: string[];
    estimated_completion?: string;
    category?: string;
  })[];
  onLessonClick?: (lessonId: string, position: number) => void;
  showPersonalizationScore?: boolean;
}

export const PersonalizedLessonsGrid: React.FC<PersonalizedLessonsGridProps> = ({
  lessons,
  onLessonClick,
  showPersonalizationScore = false
}) => {
  const navigate = useNavigate();
  const { hasFeatureAccess } = useFeatureAccess();
  const { showUpgradeModal } = usePremiumUpgradeModal();

  const handleLessonClick = (lesson: any, index: number) => {
    if (!hasFeatureAccess('learning')) {
      showUpgradeModal('learning', lesson.title);
      return;
    }
    if (onLessonClick) {
      onLessonClick(lesson.lessonId, index);
    }
    navigate(`/learning/courses/${lesson.courseId}/modules/${lesson.moduleId}/lessons/${lesson.lessonId}`);
  };

  const getPriorityConfig = (priority: number) => {
    switch (priority) {
      case 1:
        return {
          label: 'Alta Prioridade',
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          bgGradient: 'from-red-500/10 to-red-600/5'
        };
      case 2:
        return {
          label: 'Prioridade Média',
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          bgGradient: 'from-yellow-500/10 to-yellow-600/5'
        };
      case 3:
        return {
          label: 'Prioridade Baixa',
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          bgGradient: 'from-blue-500/10 to-blue-600/5'
        };
      default:
        return {
          label: 'Prioridade Padrão',
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          bgGradient: 'from-gray-500/10 to-gray-600/5'
        };
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'fundamentos':
        return <BookOpen className="h-4 w-4" />;
      case 'aplicação':
        return <Target className="h-4 w-4" />;
      case 'avançado':
        return <Brain className="h-4 w-4" />;
      case 'especialização':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <PlayCircle className="h-4 w-4" />;
    }
  };

  if (!lessons || lessons.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma aula recomendada</h3>
          <p className="text-muted-foreground">
            Complete seu onboarding para receber recomendações personalizadas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Trilha de Aprendizado Personalizada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{lessons.length}</div>
              <div className="text-sm text-muted-foreground">Aulas Recomendadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {lessons.filter(l => l.priority === 1).length}
              </div>
              <div className="text-sm text-muted-foreground">Alta Prioridade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {showPersonalizationScore 
                  ? Math.round(lessons.reduce((acc, l) => acc + (l.personalizationScore || 0), 0) / lessons.length)
                  : '95'
                }%
              </div>
              <div className="text-sm text-muted-foreground">Score de Personalização</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Aulas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lessons.map((lesson, index) => {
          const priorityConfig = getPriorityConfig(lesson.priority);
          
          return (
            <Card 
              key={`${lesson.lessonId}-${index}`}
              className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br ${priorityConfig.bgGradient} border-border/50 hover:border-primary/50`}
              onClick={() => handleLessonClick(lesson, index)}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              
              <CardContent className="p-0 relative z-10">
                <div className="flex h-48">
                  {/* Seção da imagem/ícone */}
                  <div className="w-48 relative overflow-hidden rounded-l-lg bg-gradient-to-br from-primary/20 to-accent/20">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        {getCategoryIcon(lesson.category)}
                        <div className="mt-2">
                          {getCategoryIcon(lesson.category)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {lesson.category || 'Aula Personalizada'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Badge de prioridade */}
                    <div className="absolute top-3 left-3">
                      <Badge className={`text-xs px-2 py-1 border ${priorityConfig.color} backdrop-blur-sm`}>
                        {priorityConfig.label}
                      </Badge>
                    </div>

                    {/* Score de personalização */}
                    {showPersonalizationScore && lesson.personalizationScore && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-primary/90 text-primary-foreground rounded-full px-2 py-1 text-xs font-bold">
                          {lesson.personalizationScore}%
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Seção do conteúdo */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            #{index + 1}
                          </span>
                          {lesson.estimated_completion && (
                            <span className="text-xs text-muted-foreground">
                              {lesson.estimated_completion}
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
                          {lesson.title}
                        </h4>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {lesson.justification}
                      </p>

                      {/* Conexões com soluções */}
                      {lesson.connects_to_solutions && lesson.connects_to_solutions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {lesson.connects_to_solutions.slice(0, 2).map((solutionId, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              Conecta com solução
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="space-y-3 pt-3 border-t border-border/50">
                      {/* Progresso de personalização */}
                      {showPersonalizationScore && lesson.personalizationScore && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Relevância</span>
                            <span className="font-medium">{lesson.personalizationScore}%</span>
                          </div>
                          <Progress value={lesson.personalizationScore} className="h-1" />
                        </div>
                      )}
                      
                      <Button 
                        size="sm" 
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg group-hover:shadow-primary/25 group-hover:shadow-xl group-hover:scale-105 transition-all duration-200"
                      >
                        Iniciar Aula
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};