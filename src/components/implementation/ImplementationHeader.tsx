
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
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold text-white">
            {solution.title}
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {solution.category}
            </Badge>
            <Badge variant="outline" className="text-gray-300 border-gray-600">
              {solution.difficulty}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-gray-300 mb-2">
            <Target className="h-4 w-4" />
            <span className="text-sm">Implementação</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Etapa {currentModuleIndex + 1} de {totalModules}</span>
          </div>
        </div>
      </div>
    </CardHeader>
  );
};
