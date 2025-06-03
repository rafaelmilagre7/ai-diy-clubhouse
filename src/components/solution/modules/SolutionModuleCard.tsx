
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Clock, BookOpen } from "lucide-react";
import { Module } from "@/lib/supabase";
import { SolutionModuleContent } from "./SolutionModuleContent";

interface SolutionModuleCardProps {
  module: Module;
  moduleNumber: number;
}

export const SolutionModuleCard = ({ module, moduleNumber }: SolutionModuleCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getModuleTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      "landing": "Apresentação",
      "overview": "Visão Geral",
      "preparation": "Preparação",
      "implementation": "Implementação",
      "verification": "Verificação",
      "results": "Resultados",
      "optimization": "Otimização",
      "celebration": "Celebração"
    };
    return typeLabels[type] || type;
  };

  return (
    <Card className="border-white/10 bg-backgroundLight">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-viverblue text-white text-sm font-medium">
              {moduleNumber}
            </div>
            <div>
              <h4 className="font-medium text-textPrimary">{module.title}</h4>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-xs px-2 py-1 rounded bg-blue-900/40 text-blue-200 border border-blue-700/30">
                  {getModuleTypeLabel(module.type)}
                </span>
                {module.estimated_time_minutes && module.estimated_time_minutes > 0 && (
                  <div className="flex items-center text-xs text-textSecondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {module.estimated_time_minutes} min
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-textSecondary hover:text-textPrimary"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {isExpanded ? "Ocultar" : "Ver conteúdo"}
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 ml-2" />
            ) : (
              <ChevronRight className="h-4 w-4 ml-2" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <SolutionModuleContent module={module} />
        </CardContent>
      )}
    </Card>
  );
};
