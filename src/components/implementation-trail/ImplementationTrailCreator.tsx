
import React from "react";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { useTrailGuidedExperience } from "@/hooks/implementation/useTrailGuidedExperience";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Sparkles, ArrowRight } from "lucide-react";
import { TrailMagicExperience } from "@/components/onboarding/TrailMagicExperience";

export const ImplementationTrailCreator: React.FC = () => {
  const { trail, isLoading, regenerating, refreshing, error, hasContent, generateImplementationTrail } = useImplementationTrail();
  const {
    started,
    showMagicExperience,
    currentStepIdx,
    solutionsList,
    currentSolution,
    handleStartGeneration,
    handleMagicFinish
  } = useTrailGuidedExperience();

  // Estado de carregamento principal
  if (isLoading || regenerating || refreshing) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 text-viverblue animate-spin mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {regenerating ? "Gerando sua trilha personalizada..." : "Carregando trilha..."}
          </h3>
          <p className="text-neutral-400 text-center max-w-md">
            {regenerating 
              ? "Estamos analisando seu perfil e criando recomendações personalizadas para seu negócio."
              : "Aguarde enquanto carregamos sua trilha de implementação."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  // Mostrar experiência mágica durante geração
  if (showMagicExperience) {
    return (
      <div className="w-full">
        <TrailMagicExperience onFinish={handleMagicFinish} />
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-400">Erro ao Carregar Trilha</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-300 mb-4">{error}</p>
          <Button 
            onClick={() => generateImplementationTrail()}
            className="bg-viverblue hover:bg-viverblue/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Estado inicial - sem trilha
  if (!hasContent) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-viverblue" />
            Gerar Trilha de Implementação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-viverblue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-10 w-10 text-viverblue" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Crie sua trilha personalizada
              </h3>
              <p className="text-neutral-400 max-w-md mx-auto">
                Com base no seu perfil e objetivos, vamos criar uma trilha de implementação de IA 
                personalizada para acelerar o crescimento do seu negócio.
              </p>
            </div>
            
            <Button 
              onClick={() => handleStartGeneration(true)}
              className="bg-viverblue hover:bg-viverblue/90 text-white px-8 py-3 text-lg"
              size="lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Gerar Minha Trilha
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado com trilha - mostrar experiência guiada ou conteúdo da trilha
  if (started && solutionsList.length > 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sua Trilha de Implementação</CardTitle>
          <p className="text-neutral-400">
            {solutionsList.length} soluções personalizadas para seu negócio
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentSolution && (
              <div className="bg-[#151823]/80 rounded-lg p-6 border border-neutral-700/50">
                <h4 className="text-xl font-semibold text-white mb-2">
                  {currentSolution.title}
                </h4>
                <p className="text-neutral-300 mb-4">
                  {currentSolution.description}
                </p>
                <p className="text-viverblue text-sm">
                  {currentSolution.justification}
                </p>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-neutral-400 mb-4">
                Solução {currentStepIdx + 1} de {solutionsList.length}
              </p>
              <Button 
                onClick={() => generateImplementationTrail()}
                variant="outline"
                className="border-viverblue text-viverblue hover:bg-viverblue/10"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerar Trilha
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fallback - mostrar conteúdo básico da trilha
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Trilha de Implementação Carregada</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-neutral-300 mb-4">
            Sua trilha foi carregada com sucesso!
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => handleStartGeneration(false)}
              className="bg-viverblue hover:bg-viverblue/90"
            >
              Ver Trilha Detalhada
            </Button>
            <Button 
              onClick={() => generateImplementationTrail()}
              variant="outline"
              className="border-viverblue text-viverblue hover:bg-viverblue/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
