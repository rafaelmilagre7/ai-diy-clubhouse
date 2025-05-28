
import React from "react";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Sparkles, ArrowRight } from "lucide-react";
import { TrailSolutionsDisplay } from "./TrailSolutionsDisplay";

export const ImplementationTrailCreator: React.FC = () => {
  const { 
    trail, 
    isLoading, 
    regenerating, 
    refreshing, 
    error, 
    hasContent, 
    generateImplementationTrail,
    refreshTrail 
  } = useImplementationTrail();

  console.log('ImplementationTrailCreator state:', {
    trail,
    isLoading,
    regenerating,
    refreshing,
    error,
    hasContent
  });

  // Estado de carregamento
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

  // Estado de erro
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-400">Erro ao Carregar Trilha</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-300 mb-4">{error}</p>
          <div className="flex gap-4">
            <Button 
              onClick={() => generateImplementationTrail()}
              className="bg-viverblue hover:bg-viverblue/90"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Gerar Trilha
            </Button>
            <Button 
              onClick={() => refreshTrail()}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recarregar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado com trilha existente
  if (hasContent && trail) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-viverblue" />
            Sua Trilha de Implementação
          </CardTitle>
          <p className="text-neutral-400">
            Trilha personalizada com base no seu perfil e objetivos de negócio
          </p>
        </CardHeader>
        <CardContent>
          <TrailSolutionsDisplay trail={trail} />
          
          <div className="mt-6 text-center">
            <Button 
              onClick={() => generateImplementationTrail()}
              variant="outline"
              className="border-viverblue text-viverblue hover:bg-viverblue/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerar Trilha
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado inicial - sem trilha
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
            onClick={() => generateImplementationTrail()}
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
};
