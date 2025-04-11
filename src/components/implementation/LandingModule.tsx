
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface LandingModuleProps {
  onComplete: () => void;
}

export const LandingModule = ({ onComplete }: LandingModuleProps) => {
  return (
    <div className="max-w-3xl mx-auto text-center space-y-8 py-12">
      <h1 className="text-4xl font-bold">Bem-vindo à implementação</h1>
      <p className="text-xl text-muted-foreground">
        Vamos guiar você passo a passo na implementação desta solução de IA.
      </p>
      <div className="flex flex-col items-center space-y-2">
        <p className="text-muted-foreground">Esta implementação tem 8 módulos:</p>
        <ol className="space-y-2 text-left">
          <li className="flex items-center">
            <span className="bg-viverblue text-white rounded-full h-6 w-6 flex items-center justify-center mr-2">1</span>
            <span>Início - Onde você está agora</span>
          </li>
          <li className="flex items-center">
            <span className="bg-secondary text-secondary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-2">2</span>
            <span>Visão Geral - Entenda o valor e contexto</span>
          </li>
          <li className="flex items-center">
            <span className="bg-secondary text-secondary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-2">3</span>
            <span>Preparação - Configure seu ambiente</span>
          </li>
          <li className="flex items-center">
            <span className="bg-secondary text-secondary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-2">4</span>
            <span>Implementação - Guia passo a passo</span>
          </li>
          <li className="flex items-center">
            <span className="bg-secondary text-secondary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-2">5</span>
            <span>Verificação - Confirme que está funcionando</span>
          </li>
          <li className="flex items-center">
            <span className="bg-secondary text-secondary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-2">6</span>
            <span>Resultados - Extraia valor imediato</span>
          </li>
          <li className="flex items-center">
            <span className="bg-secondary text-secondary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-2">7</span>
            <span>Otimização - Melhore o desempenho</span>
          </li>
          <li className="flex items-center">
            <span className="bg-secondary text-secondary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-2">8</span>
            <span>Celebração - Comemore seu sucesso</span>
          </li>
        </ol>
      </div>
      <div className="pt-6">
        <Button size="lg" onClick={onComplete}>
          <ChevronRight className="mr-2 h-5 w-5" />
          Começar Implementação
        </Button>
      </div>
    </div>
  );
};
