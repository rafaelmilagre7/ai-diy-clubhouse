
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSolutionData } from '@/hooks/useSolutionData';
import { useModuleFetch } from '@/hooks/modules/useModuleFetch';
import { useImplementationNavigation } from '@/hooks/implementation/useImplementationNavigation';
import { ModuleContent } from '@/components/implementation/ModuleContent';
import { SolutionHeaderSection } from '@/components/solution/SolutionHeaderSection';
import { SolutionContentSection } from '@/components/solution/SolutionContentSection';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLogging } from '@/hooks/useLogging';

const SolutionImplementation = () => {
  const { id, moduleIdx } = useParams<{ id: string; moduleIdx?: string }>();
  const navigate = useNavigate();
  const { log } = useLogging();
  
  // Detectar se estamos em modo wizard (tem moduleIdx)
  const isWizardMode = moduleIdx !== undefined;
  const currentModuleIndex = isWizardMode ? parseInt(moduleIdx!) : 0;
  
  // Buscar dados da solução
  const { solution, loading: solutionLoading, error } = useSolutionData(id);
  
  // Buscar módulos da solução
  const { modules, isLoading: modulesLoading } = useModuleFetch(solution?.id || null);
  
  // Navegação do wizard
  const { handleComplete, handlePrevious } = useImplementationNavigation();
  
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const loading = solutionLoading || modulesLoading;
  const currentModule = modules[currentModuleIndex] || null;
  
  useEffect(() => {
    if (solution && isWizardMode) {
      log('Iniciando wizard de implementação', { 
        solutionId: solution.id, 
        moduleIndex: currentModuleIndex,
        totalModules: modules.length 
      });
    }
  }, [solution, isWizardMode, currentModuleIndex, modules.length, log]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !solution) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Solução não encontrada</h1>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar os dados desta solução.
          </p>
          <Button onClick={() => navigate('/solutions')}>
            Voltar para Soluções
          </Button>
        </div>
      </div>
    );
  }

  // Modo wizard - renderizar módulos
  if (isWizardMode) {
    if (modules.length === 0) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Implementação não disponível</h1>
            <p className="text-muted-foreground mb-4">
              Esta solução ainda não possui módulos de implementação configurados.
            </p>
            <Button onClick={() => navigate(`/solution/${id}`)}>
              Voltar para Detalhes
            </Button>
          </div>
        </div>
      );
    }

    if (currentModuleIndex >= modules.length) {
      // Implementação concluída
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">🎉 Implementação Concluída!</h1>
            <p className="text-muted-foreground mb-4">
              Parabéns! Você completou todos os módulos desta solução.
            </p>
            <div className="space-x-4">
              <Button onClick={() => navigate(`/solution/${id}`)}>
                Ver Detalhes da Solução
              </Button>
              <Button variant="outline" onClick={() => navigate('/solutions')}>
                Explorar Outras Soluções
              </Button>
            </div>
          </div>
        </div>
      );
    }

    const progressPercentage = ((currentModuleIndex + 1) / modules.length) * 100;

    return (
      <div className="min-h-screen bg-background">
        {/* Header do Wizard */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate(`/solution/${id}`)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold">{solution.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    Módulo {currentModuleIndex + 1} de {modules.length}
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {Math.round(progressPercentage)}% concluído
              </div>
            </div>
            
            <Progress value={progressPercentage} className="w-full" />
          </div>
        </div>

        {/* Conteúdo do Módulo */}
        <div className="container mx-auto px-4 py-8">
          <ModuleContent 
            module={currentModule}
            onComplete={handleComplete}
            onError={(error) => {
              log('Erro no módulo', { error, moduleId: currentModule?.id });
            }}
          />
        </div>

        {/* Navegação do Wizard */}
        <div className="border-t bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Button 
                variant="outline"
                onClick={handlePrevious}
                disabled={currentModuleIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              
              <div className="text-sm text-muted-foreground">
                {currentModule?.title || `Módulo ${currentModuleIndex + 1}`}
              </div>
              
              <Button 
                onClick={handleComplete}
                disabled={!hasInteracted && currentModule?.type !== 'landing' && currentModule?.type !== 'celebration'}
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modo página de detalhes - manter comportamento original
  return (
    <div className="min-h-screen bg-background">
      <SolutionHeaderSection solution={solution} />
      <SolutionContentSection solution={solution} />
    </div>
  );
};

export default SolutionImplementation;
