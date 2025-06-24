
import React from "react";
import { Solution } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, CheckCircle, AlertCircle } from "lucide-react";

interface OverviewTabProps {
  solution: Solution;
}

export const OverviewTab = ({ solution }: OverviewTabProps) => {
  return (
    <div className="space-y-6">
      {/* Descrição Principal */}
      <Card className="bg-[#151823] border border-white/5">
        <CardHeader>
          <CardTitle className="text-neutral-100 flex items-center gap-2">
            <Target className="h-5 w-5 text-viverblue" />
            Sobre esta Solução
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-200 leading-relaxed">
            {solution.description}
          </p>
        </CardContent>
      </Card>

      {/* Informações da Solução */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categoria e Dificuldade */}
        <Card className="bg-[#151823] border border-white/5">
          <CardHeader>
            <CardTitle className="text-neutral-100 text-lg">
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-neutral-400 mb-2">Categoria</h4>
              <Badge variant="outline" className="bg-neutral-800 text-white border-neutral-700">
                {solution.category}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-medium text-neutral-400 mb-2">Dificuldade</h4>
              <Badge 
                variant="outline" 
                className={`${
                  solution.difficulty === "easy" ? "bg-emerald-900/30 text-emerald-400 border-emerald-900/30" :
                  solution.difficulty === "medium" ? "bg-amber-900/30 text-amber-400 border-amber-900/30" :
                  "bg-rose-900/30 text-rose-400 border-rose-900/30"
                }`}
              >
                {solution.difficulty === "easy" ? "Fácil" :
                 solution.difficulty === "medium" ? "Médio" :
                 "Avançado"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Status e Tempo */}
        <Card className="bg-[#151823] border border-white/5">
          <CardHeader>
            <CardTitle className="text-neutral-100 text-lg">
              Status da Solução
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {solution.published ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-green-400">Publicada</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span className="text-amber-400">Em desenvolvimento</span>
                </>
              )}
            </div>
            
            {/* Tempo estimado se disponível */}
            {"estimated_time" in solution && typeof (solution as any).estimated_time === "number" && (solution as any).estimated_time > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-neutral-200">
                  Tempo estimado: {(solution as any).estimated_time} minutos
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Placeholder para conteúdo futuro */}
      <Card className="bg-[#151823] border border-white/5">
        <CardHeader>
          <CardTitle className="text-neutral-100 text-lg">
            O que você vai aprender
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-400 italic">
            Conteúdo detalhado será expandido nas próximas atualizações com base nos módulos e recursos da solução.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
