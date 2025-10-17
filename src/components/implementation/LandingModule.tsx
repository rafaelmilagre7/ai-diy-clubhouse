
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Module } from "@/lib/supabase";
import { ModuleTitle } from "./ModuleTitle";

interface LandingModuleProps {
  module: Module;
  onComplete: () => void;
}

export const LandingModule = ({ module, onComplete }: LandingModuleProps) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">
          <ModuleTitle type={module.type} />
        </h1>
        <p className="text-xl text-muted-foreground">
          Bem-vindo à implementação guiada passo a passo
        </p>
      </div>
      
      <div className="bg-operational/10 p-6 rounded-lg border border-operational/20">
        <h2 className="text-xl font-semibold mb-4 text-operational">O que você vai aprender</h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <div className="h-6 w-6 rounded-full bg-operational/20 text-operational flex items-center justify-center mr-3 flex-shrink-0">1</div>
            <span>Como configurar todas as ferramentas necessárias</span>
          </li>
          <li className="flex items-start">
            <div className="h-6 w-6 rounded-full bg-operational/20 text-operational flex items-center justify-center mr-3 flex-shrink-0">2</div>
            <span>O passo a passo detalhado da implementação</span>
          </li>
          <li className="flex items-start">
            <div className="h-6 w-6 rounded-full bg-operational/20 text-operational flex items-center justify-center mr-3 flex-shrink-0">3</div>
            <span>Como validar que tudo está funcionando corretamente</span>
          </li>
          <li className="flex items-start">
            <div className="h-6 w-6 rounded-full bg-operational/20 text-operational flex items-center justify-center mr-3 flex-shrink-0">4</div>
            <span>Estratégias para otimizar e escalar os resultados</span>
          </li>
        </ul>
      </div>
      
      <div className="bg-status-warning/10 p-6 rounded-lg border border-status-warning/20">
        <h2 className="text-xl font-semibold mb-4 text-status-warning">Antes de começar</h2>
        <p className="mb-4">
          Esta implementação levará aproximadamente 1-2 horas para ser concluída.
          Recomendamos que você reserve esse tempo para seguir todos os passos sem interrupções.
        </p>
        <p>Tenha à mão:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Acesso às suas contas de ferramentas (se aplicável)</li>
          <li>Permissões para implementar esta solução em sua empresa</li>
          <li>Um ambiente tranquilo para concentração</li>
        </ul>
      </div>
      
      <div className="text-center pt-8">
        <Button 
          onClick={onComplete} 
          size="lg"
          variant="aurora-primary"
        >
          Começar Implementação
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
        <p className="text-sm text-muted-foreground mt-4">
          Seu progresso será salvo automaticamente em cada etapa
        </p>
      </div>
    </div>
  );
};
