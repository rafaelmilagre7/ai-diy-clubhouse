
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useImplementationTrail } from '@/hooks/implementation/useImplementationTrail';
import { useTrailEnrichment } from '@/hooks/implementation/useTrailEnrichment';
import { useTrailSolutionsEnrichment } from '@/hooks/implementation/useTrailSolutionsEnrichment';
import { useOnboardingCompletion } from '@/hooks/onboarding/useOnboardingCompletion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Target } from 'lucide-react';
import LoadingScreen from '@/components/common/LoadingScreen';

const ImplementationTrailPage = () => {
  const navigate = useNavigate();
  const { trail, isLoading, hasContent, refreshTrail, generateImplementationTrail } = useImplementationTrail();
  const { enrichedLessons, isLoading: lessonsLoading } = useTrailEnrichment(trail);
  const { enrichedSolutions, isLoading: solutionsLoading } = useTrailSolutionsEnrichment(trail);
  const { 
    data: onboardingData, 
    isLoading: onboardingLoading 
  } = useOnboardingCompletion();

  const handleRegenerateTrail = async () => {
    await generateImplementationTrail();
  };

  const handleSolutionClick = (id: string) => {
    navigate(`/solucoes/${id}`);
  };

  const handleLessonClick = (courseId: string, lessonId: string) => {
    navigate(`/aprendizado/curso/${courseId}/aula/${lessonId}`);
  };

  const handleNavigateToOnboarding = () => {
    navigate('/onboarding-new');
  };

  if (isLoading || onboardingLoading) {
    return <LoadingScreen message="Carregando sua trilha de implementação..." />;
  }

  const isOnboardingComplete = onboardingData?.isCompleted || false;

  if (!isOnboardingComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Target className="h-5 w-5 text-viverblue" />
              Complete seu onboarding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Para ter acesso à sua trilha de implementação personalizada, você precisa completar o onboarding primeiro.
            </p>
            <Button onClick={handleNavigateToOnboarding} className="w-full">
              Completar onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-viverblue" />
              Gerar trilha de implementação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Sua trilha personalizada ainda não foi gerada. Clique no botão abaixo para criar uma trilha baseada no seu perfil.
            </p>
            <Button onClick={handleRegenerateTrail} className="w-full">
              Gerar trilha personalizada
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoadingContent = lessonsLoading || solutionsLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Trilha de Implementação</h1>
            <p className="text-muted-foreground">
              Sua trilha personalizada baseada no seu perfil e objetivos
            </p>
          </div>
          <Button onClick={handleRegenerateTrail} variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            Regenerar trilha
          </Button>
        </div>

        {isLoadingContent ? (
          <LoadingScreen message="Carregando conteúdo da trilha..." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Soluções recomendadas */}
            {enrichedSolutions && enrichedSolutions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-viverblue" />
                    Soluções recomendadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {enrichedSolutions.map((solution) => (
                    <div
                      key={solution.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSolutionClick(solution.id)}
                    >
                      <h4 className="font-medium">{solution.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {solution.description?.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Aulas recomendadas */}
            {enrichedLessons && enrichedLessons.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-viverblue" />
                    Aulas recomendadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {enrichedLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleLessonClick(lesson.course_id, lesson.id)}
                    >
                      <h4 className="font-medium">{lesson.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {lesson.description?.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImplementationTrailPage;
