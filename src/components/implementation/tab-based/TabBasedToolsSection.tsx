
import React from "react";
import { useSolutionDataContext } from "@/contexts/SolutionDataContext";
import { SolutionToolCard } from "@/components/solution/tools/SolutionToolCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TabBasedToolsSectionProps {
  onSectionComplete: () => void;
  isCompleted: boolean;
}

export const TabBasedToolsSection = ({ onSectionComplete, isCompleted }: TabBasedToolsSectionProps) => {
  const { data, isLoading } = useSolutionDataContext();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const tools = data?.tools || [];

  if (tools.length === 0) {
    return (
      <Card className="border-white/10">
        <CardContent className="p-8 text-center">
          <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma ferramenta necessária</h3>
          <p className="text-gray-500 mb-4">
            Esta solução não requer ferramentas específicas para implementação.
          </p>
          <Button 
            onClick={onSectionComplete}
            className="bg-viverblue hover:bg-viverblue-dark"
          >
            Continuar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Ferramentas Necessárias
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Configure e prepare estas ferramentas para implementar a solução
            </p>
          </div>
          {isCompleted && (
            <CheckCircle className="w-6 h-6 text-green-500" />
          )}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <SolutionToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={onSectionComplete}
          disabled={isCompleted}
          className="bg-viverblue hover:bg-viverblue-dark"
        >
          {isCompleted ? "Seção Concluída" : "Marcar como Concluída"}
        </Button>
      </div>
    </div>
  );
};
