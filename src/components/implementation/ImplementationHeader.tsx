
import React from "react";
import { Solution, Module } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Target } from "lucide-react";

interface ImplementationHeaderProps {
  solution: Solution;
  currentModuleIndex: number;
  totalModules: number;
  currentModule: Module | null;
}

export const ImplementationHeader: React.FC<ImplementationHeaderProps> = ({
  solution,
  currentModuleIndex,
  totalModules,
  currentModule
}) => {
  return (
    <CardHeader className="bg-gradient-to-r from-[#0ABAB5] to-[#0ABAB5]/80 text-white rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold mb-2">{solution.title}</CardTitle>
          <p className="text-white/90">{solution.description}</p>
          {currentModule && (
            <p className="text-white/80 mt-2 font-medium">
              {currentModule.title}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Badge variant="outline" className="bg-white/20 text-white border-white/30">
            {solution.category}
          </Badge>
          <Badge 
            variant="outline" 
            className={`
              border-white/30 text-white
              ${solution.difficulty === 'easy' ? 'bg-green-500/20' : 
                solution.difficulty === 'medium' ? 'bg-orange-500/20' : 
                'bg-red-500/20'}
            `}
          >
            {solution.difficulty === 'easy' ? 'Fácil' : 
             solution.difficulty === 'medium' ? 'Médio' : 'Avançado'}
          </Badge>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Clock className="h-4 w-4" />
            <span>Módulo {currentModuleIndex + 1} de {totalModules}</span>
          </div>
        </div>
      </div>
    </CardHeader>
  );
};
