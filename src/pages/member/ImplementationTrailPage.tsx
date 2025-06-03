
import React from 'react';
import { useImplementationTrail } from '@/hooks/implementation/useImplementationTrail';
import { useTrailEnrichment } from '@/hooks/implementation/useTrailEnrichment';
import { useTrailSolutionsEnrichment } from '@/hooks/implementation/useTrailSolutionsEnrichment';
import { useOnboardingCompletion } from '@/hooks/onboarding/useOnboardingCompletion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Target, BookOpen, ArrowLeft } from 'lucide-react';
import { TrailSolutionEnriched, TrailLessonEnriched } from '@/types/implementation-trail';

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

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Se ainda está carregando dados do onboarding ou trilha inicial
  if (isLoading || onboardingLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToDashboard}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue"></div>
              <span className="ml-3 text-lg">Carregando trilha de implementação...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se onboarding não foi completado, mostrar estado específico
  const isOnboardingComplete = onboardingData?.isCompleted || false;
  if (!isOnboardingComplete) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToDashboard}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-viverblue mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Complete seu Onboarding</h2>
            <p className="text-muted-foreground mb-6">
              Para gerar sua trilha personalizada de implementação, você precisa completar o processo de onboarding.
            </p>
            <Button onClick={() => navigate('/onboarding-new')}>
              Completar Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se onboarding completo mas não tem trilha, mostrar estado vazio
  if (!hasContent) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToDashboard}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-viverblue mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Sua Trilha de Implementação</h2>
            <p className="text-muted-foreground mb-6">
              Sua trilha personalizada ainda não foi gerada. Clique no botão abaixo para criar uma trilha baseada no seu perfil e objetivos.
            </p>
            <Button onClick={handleRegenerateTrail} className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Gerar Trilha Personalizada
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se tem trilha, mostrar conteúdo completo
  const isLoadingContent = lessonsLoading || solutionsLoading;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={handleBackToDashboard}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Button>
        
        <Button
          onClick={handleRegenerateTrail}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Regenerar Trilha
        </Button>
      </div>

      {/* Título principal */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
          <Sparkles className="h-8 w-8 text-viverblue" />
          Sua Trilha de Implementação IA
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Uma trilha personalizada baseada no seu perfil, objetivos e experiência com IA.
          Siga as recomendações para implementar soluções de forma estruturada.
        </p>
      </div>

      {isLoadingContent ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue"></div>
              <span className="ml-3 text-lg">Carregando conteúdo da trilha...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8">
          {/* Soluções Recomendadas */}
          {enrichedSolutions && enrichedSolutions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-viverblue" />
                  Soluções Recomendadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {enrichedSolutions.map((solution) => (
                    <Card 
                      key={solution.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleSolutionClick(solution.id)}
                    >
                      <CardContent className="p-4">
                        {solution.thumbnail_url && (
                          <img 
                            src={solution.thumbnail_url} 
                            alt={solution.title}
                            className="w-full h-32 object-cover rounded mb-3"
                          />
                        )}
                        <h3 className="font-semibold mb-2">{solution.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {solution.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-viverblue/10 text-viverblue px-2 py-1 rounded">
                            {solution.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {solution.difficulty}
                          </span>
                        </div>
                        {solution.justification && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            {solution.justification}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Aulas Recomendadas */}
          {enrichedLessons && enrichedLessons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-viverblue" />
                  Aulas Recomendadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {enrichedLessons.map((lesson) => (
                    <Card 
                      key={lesson.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleLessonClick(lesson.courseId, lesson.id)}
                    >
                      <CardContent className="p-4">
                        {lesson.cover_image_url && (
                          <img 
                            src={lesson.cover_image_url} 
                            alt={lesson.title}
                            className="w-full h-32 object-cover rounded mb-3"
                          />
                        )}
                        <h3 className="font-semibold mb-2">{lesson.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {lesson.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{lesson.module.course.title}</span>
                          {lesson.estimated_time_minutes && (
                            <span>{lesson.estimated_time_minutes} min</span>
                          )}
                        </div>
                        {lesson.justification && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            {lesson.justification}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Caso não tenha nem soluções nem aulas */}
          {(!enrichedSolutions || enrichedSolutions.length === 0) && 
           (!enrichedLessons || enrichedLessons.length === 0) && (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Trilha em construção</h3>
                <p className="text-muted-foreground mb-4">
                  Sua trilha foi gerada mas ainda não há conteúdo disponível. 
                  Tente regenerar a trilha ou aguarde novos conteúdos serem adicionados.
                </p>
                <Button onClick={handleRegenerateTrail} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar Trilha
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ImplementationTrailPage;
