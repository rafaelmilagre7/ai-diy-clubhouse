import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BookOpen, Target, TrendingUp, Clock, Star, ChevronRight, Brain, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface PersonalizedTrail {
  overview: {
    analysis: string;
    opportunities: string;
    strategic_goals: string;
    implementation_phases: string[];
  };
  solutions_guide: {
    quick_wins: Array<{
      solution_id: string;
      priority_score: number;
      category: string;
      reasoning: string;
      expected_impact: string;
      implementation_timeframe: string;
      solution_data?: any;
    }>;
    growth_solutions: Array<{
      solution_id: string;
      priority_score: number;
      category: string;
      reasoning: string;
      expected_impact: string;
      implementation_timeframe: string;
      solution_data?: any;
    }>;
    optimization_solutions: Array<{
      solution_id: string;
      priority_score: number;
      category: string;
      reasoning: string;
      expected_impact: string;
      implementation_timeframe: string;
      solution_data?: any;
    }>;
  };
  lessons_guide: {
    learning_path: Array<{
      lesson_id: string;
      sequence: number;
      category: string;
      reasoning: string;
      connects_to_solutions: string[];
      estimated_completion: string;
      lesson_data?: any;
    }>;
    total_learning_time: string;
    learning_objectives: string[];
  };
  personalized_message: string;
  user_profile?: any;
  generation_timestamp?: string;
  analysis_type?: string;
}

export const LessonsTab = () => {
  const [personalizedTrail, setPersonalizedTrail] = useState<PersonalizedTrail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPersonalizedTrail();
  }, []);

  const fetchPersonalizedTrail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('recommend-lessons-ai');

      if (error) {
        console.error('Erro ao buscar trilha personalizada:', error);
        throw error;
      }

      console.log('✅ Trilha personalizada recebida:', data);
      setPersonalizedTrail(data);

    } catch (err: any) {
      console.error('Erro ao buscar trilha personalizada:', err);
      setError(err.message || 'Erro ao carregar trilha personalizada');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-6">
          <div className="relative">
            <Brain className="w-16 h-16 mx-auto text-primary animate-pulse" />
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              🧠 IA criando sua trilha personalizada...
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Nossa inteligência artificial está analisando seu perfil, progresso e objetivos
              para criar um guia completo de implementação de IA personalizado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md border-destructive/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-6 h-6 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Erro ao carregar trilha</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={fetchPersonalizedTrail} variant="outline" size="sm">
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!personalizedTrail) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhuma trilha personalizada encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header principal com mensagem personalizada */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4">
          <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl border border-primary/30">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Sua Trilha de Implementação IA
          </h1>
          <div className="p-4 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl border border-secondary/30">
            <Target className="h-10 w-10 text-secondary" />
          </div>
        </div>

        {personalizedTrail.personalized_message && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5 max-w-4xl mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center flex-1">
                  <h3 className="font-semibold mb-2">Mensagem Personalizada</h3>
                  <p className="text-sm leading-relaxed">{personalizedTrail.personalized_message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="solutions" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Soluções
          </TabsTrigger>
          <TabsTrigger value="lessons" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Aulas
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6">
            {personalizedTrail.overview?.analysis && (
              <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Target className="w-5 h-5" />
                    Análise do Seu Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{personalizedTrail.overview.analysis}</p>
                </CardContent>
              </Card>
            )}

            {personalizedTrail.overview?.opportunities && (
              <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <TrendingUp className="w-5 h-5" />
                    Oportunidades Identificadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{personalizedTrail.overview.opportunities}</p>
                </CardContent>
              </Card>
            )}

            {personalizedTrail.overview?.strategic_goals && (
              <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                    <Star className="w-5 h-5" />
                    Objetivos Estratégicos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{personalizedTrail.overview.strategic_goals}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Guia de Soluções */}
        <TabsContent value="solutions" className="space-y-8">
          {personalizedTrail.solutions_guide?.quick_wins?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-6 h-6" />
                🏆 Primeiras Vitórias
              </h3>
              <div className="grid gap-4">
                {personalizedTrail.solutions_guide.quick_wins.map((solution, index) => (
                  <Card key={index} className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20 hover:shadow-lg transition-all duration-300">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className="bg-green-500 text-white">#{index + 1}</Badge>
                            <h4 className="font-semibold text-green-800 dark:text-green-200">
                              {solution.solution_data?.title || 'Solução não encontrada'}
                            </h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{solution.reasoning}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {solution.implementation_timeframe}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              Score: {solution.priority_score}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                        <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                          💡 {solution.expected_impact}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Guia de Aulas */}
        <TabsContent value="lessons" className="space-y-6">
          {personalizedTrail.lessons_guide?.learning_path?.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  📚 Sua Jornada de Aprendizado
                </h3>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {personalizedTrail.lessons_guide.total_learning_time || '8-12 semanas'}
                </Badge>
              </div>

              <div className="space-y-6">
                {personalizedTrail.lessons_guide.learning_path
                  .sort((a, b) => a.sequence - b.sequence)
                  .map((lesson, index) => (
                    <div key={lesson.lesson_id} className="relative">
                      {index < personalizedTrail.lessons_guide.learning_path.length - 1 && (
                        <div className="absolute left-8 top-20 w-0.5 h-16 bg-gradient-to-b from-primary to-primary/30" />
                      )}
                      
                      <div className="flex gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-background shadow-lg">
                          <span className="text-xl font-bold text-white">{lesson.sequence}</span>
                        </div>
                        
                        <div className="flex-1">
                          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                            <CardContent className="pt-6">
                              <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge className="bg-primary text-white text-xs">
                                        {lesson.category}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {lesson.estimated_completion}
                                      </Badge>
                                    </div>
                                    <h4 className="text-lg font-semibold mb-2">
                                      {lesson.lesson_data?.title || 'Aula não encontrada'}
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      {lesson.reasoning}
                                    </p>
                                  </div>
                                  
                                  {lesson.lesson_data?.cover_image_url && (
                                    <div className="w-16 h-24 ml-4 rounded-lg overflow-hidden border">
                                      <img 
                                        src={lesson.lesson_data.cover_image_url}
                                        alt={lesson.lesson_data.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&h=600&fit=crop&crop=center&auto=format';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};