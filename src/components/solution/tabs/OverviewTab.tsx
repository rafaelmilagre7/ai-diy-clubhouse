
import React from "react";
import { Solution } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, CheckCircle, AlertCircle, FileText, Wrench, Video } from "lucide-react";
import { useSolutionResources } from "@/hooks/useSolutionResources";
import { useSolutionTools } from "@/hooks/useSolutionTools";
import { useSolutionVideos } from "@/hooks/useSolutionVideos";

interface OverviewTabProps {
  solution: Solution;
}

export const OverviewTab = ({ solution }: OverviewTabProps) => {
  const { resources } = useSolutionResources(solution.id);
  const { tools } = useSolutionTools(solution.id);
  const { videos } = useSolutionVideos(solution.id);

  const requiredTools = tools.filter(tool => tool.is_required);

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

        {/* Status e Resumo de Recursos */}
        <Card className="bg-[#151823] border border-white/5">
          <CardHeader>
            <CardTitle className="text-neutral-100 text-lg">
              Status e Recursos
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
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-neutral-400">
                  <FileText className="h-4 w-4" />
                  <span>Materiais de apoio</span>
                </div>
                <span className="text-neutral-200">{resources.length}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Wrench className="h-4 w-4" />
                  <span>Ferramentas necessárias</span>
                </div>
                <span className="text-neutral-200">{tools.length}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Video className="h-4 w-4" />
                  <span>Vídeos educacionais</span>
                </div>
                <span className="text-neutral-200">{videos.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Ferramentas Obrigatórias */}
      {requiredTools.length > 0 && (
        <Card className="bg-[#151823] border border-white/5">
          <CardHeader>
            <CardTitle className="text-neutral-100 text-lg">
              Ferramentas Obrigatórias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-400 mb-4">
              Para implementar esta solução, você precisará ter acesso às seguintes ferramentas:
            </p>
            <div className="grid gap-2">
              {requiredTools.map((tool) => (
                <div key={tool.id} className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                  <Wrench className="h-4 w-4 text-viverblue" />
                  <span className="text-neutral-200">{tool.tool_name}</span>
                  <Badge variant="outline" className="bg-amber-900/30 text-amber-400 border-amber-900/30 text-xs ml-auto">
                    Obrigatória
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximos Passos */}
      <Card className="bg-[#151823] border border-white/5">
        <CardHeader>
          <CardTitle className="text-neutral-100 text-lg">
            Como começar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-viverblue/20 text-viverblue rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <p className="text-neutral-200">
                Revise as ferramentas necessárias e certifique-se de ter acesso a elas
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-viverblue/20 text-viverblue rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <p className="text-neutral-200">
                Faça download dos materiais de apoio disponíveis
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-viverblue/20 text-viverblue rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <p className="text-neutral-200">
                Assista aos vídeos educacionais para entender o processo
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-viverblue/20 text-viverblue rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                4
              </div>
              <p className="text-neutral-200">
                Inicie a implementação seguindo os módulos em ordem
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
