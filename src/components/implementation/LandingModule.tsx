
import React from "react";
import { Module } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, TrendingUp } from "lucide-react";

interface LandingModuleProps {
  module: Module;
  solution: any;
}

const LandingModule = ({ module, solution }: LandingModuleProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Receita": return "bg-blue-500";
      case "Operacional": return "bg-green-500";
      case "Estratégia": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const formatContent = (content: any): string => {
    if (typeof content === 'string') {
      return content;
    }
    if (typeof content === 'object' && content !== null) {
      return JSON.stringify(content);
    }
    return String(content || '');
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#0ABAB5] to-blue-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative p-8 md:p-12">
          <div className="max-w-3xl">
            <Badge className={`${getCategoryColor(solution.category)} text-white mb-4`}>
              {solution.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {solution.title}
            </h1>
            <p className="text-lg md:text-xl text-blue-50 mb-6">
              {solution.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{solution.estimated_time_hours || 2}h de implementação</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                <span>Nível {solution.difficulty || 'Médio'}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>ROI: {solution.roi_potential || 'Alto'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Content */}
      {module.content && (
        <Card>
          <CardHeader>
            <CardTitle>{module.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: formatContent(module.content)
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Key Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Resultados Rápidos</h3>
            <p className="text-sm text-muted-foreground">
              Veja impacto positivo em seu negócio em poucas semanas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Fácil Implementação</h3>
            <p className="text-sm text-muted-foreground">
              Passo a passo detalhado para implementar sem complicações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Otimização Contínua</h3>
            <p className="text-sm text-muted-foreground">
              Aprenda a otimizar e melhorar constantemente os resultados
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LandingModule;
