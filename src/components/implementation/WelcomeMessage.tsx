
import React from "react";
import { Solution } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Play, Clock, Target } from "lucide-react";

interface WelcomeMessageProps {
  solution: Solution;
  onStart: () => void;
}

export const WelcomeMessage = ({ solution, onStart }: WelcomeMessageProps) => {
  return (
    <div className="bg-[#151823] border border-neutral-700 rounded-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          Bem-vindo à implementação de {solution.title}
        </h2>
        <p className="text-neutral-300 text-lg max-w-2xl mx-auto">
          {solution.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="bg-viverblue/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-viverblue" />
          </div>
          <h3 className="font-semibold text-white mb-2">Objetivo</h3>
          <p className="text-sm text-neutral-400">
            Implementar uma solução prática para seu negócio
          </p>
        </div>

        <div className="text-center">
          <div className="bg-green-900/40 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="font-semibold text-white mb-2">Tempo Estimado</h3>
          <p className="text-sm text-neutral-400">
            {solution.estimated_time ? `${solution.estimated_time} minutos` : "Variável"}
          </p>
        </div>

        <div className="text-center">
          <div className="bg-purple-900/40 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Play className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="font-semibold text-white mb-2">Dificuldade</h3>
          <p className="text-sm text-neutral-400">
            {solution.difficulty === "easy" ? "Fácil" : 
             solution.difficulty === "medium" ? "Médio" : 
             solution.difficulty === "advanced" ? "Avançado" : solution.difficulty}
          </p>
        </div>
      </div>

      <div className="text-center">
        <Button 
          onClick={onStart}
          size="lg"
          className="bg-viverblue hover:bg-viverblue/90 text-white px-8 py-3"
        >
          <Play className="w-5 h-5 mr-2" />
          Começar Implementação
        </Button>
      </div>
    </div>
  );
};
