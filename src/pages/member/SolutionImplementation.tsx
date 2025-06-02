
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, Clock, Target } from 'lucide-react';
import { useSolutionData } from '@/hooks/useSolutionData';
import LoadingScreen from '@/components/common/LoadingScreen';
import { SolutionNotFound } from '@/components/solution/SolutionNotFound';

const SolutionImplementation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { solution, loading, error, progress } = useSolutionData(id);

  if (loading) {
    return <LoadingScreen message="Carregando implementação..." />;
  }

  if (!solution) {
    return <SolutionNotFound />;
  }

  const implementationSteps = [
    { id: 1, title: 'Análise inicial', description: 'Entender os requisitos e objetivos', completed: true },
    { id: 2, title: 'Planejamento', description: 'Definir estratégia e cronograma', completed: true },
    { id: 3, title: 'Implementação', description: 'Executar a solução', completed: false },
    { id: 4, title: 'Testes', description: 'Validar resultados', completed: false },
    { id: 5, title: 'Otimização', description: 'Ajustar e melhorar', completed: false }
  ];

  const completedSteps = implementationSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / implementationSteps.length) * 100;

  return (
    <div className="container py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(`/solutions/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para detalhes
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Implementação da Solução</h1>
          <h2 className="text-xl text-muted-foreground mb-4">{solution.title}</h2>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso da implementação</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
            <div className="text-sm text-muted-foreground">
              {completedSteps} de {implementationSteps.length} etapas
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {implementationSteps.map((step, index) => (
            <Card key={step.id} className={`transition-all ${step.completed ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : index === completedSteps 
                        ? 'bg-viverblue text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : index === completedSteps ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <Target className="h-4 w-4" />
                    )}
                  </div>
                  <span className={step.completed ? 'text-green-700 dark:text-green-300' : ''}>
                    Etapa {step.id}: {step.title}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{step.description}</p>
                {index === completedSteps && !step.completed && (
                  <div className="mt-4">
                    <Button className="bg-viverblue hover:bg-viverblue-dark">
                      Iniciar esta etapa
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <Button 
            variant="outline"
            onClick={() => navigate('/solutions')}
          >
            Ver outras soluções
          </Button>
          <Button 
            className="bg-viverblue hover:bg-viverblue-dark"
            onClick={() => navigate('/implementation-trail')}
          >
            Ver trilha completa
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SolutionImplementation;
