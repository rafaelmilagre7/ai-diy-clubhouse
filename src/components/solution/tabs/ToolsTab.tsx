
import React from "react";
import { Solution } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";
import { useSolutionTools } from "@/hooks/useSolutionTools";
import { ToolItem } from "./components/ToolItem";
import { Skeleton } from "@/components/ui/skeleton";

interface ToolsTabProps {
  solution: Solution;
}

export const ToolsTab = ({ solution }: ToolsTabProps) => {
  const { tools, loading, error } = useSolutionTools(solution.id);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-[#151823] border border-white/5">
          <CardHeader>
            <CardTitle className="text-neutral-100 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-viverblue" />
              Ferramentas Necessárias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-white/5 rounded-lg">
                  <div className="flex items-start gap-3 mb-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="bg-[#151823] border border-white/5">
          <CardHeader>
            <CardTitle className="text-neutral-100 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-viverblue" />
              Ferramentas Necessárias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-300 mb-2">
                Erro ao carregar ferramentas
              </h3>
              <p className="text-neutral-400 max-w-md mx-auto">
                Houve um problema ao carregar as ferramentas. Tente novamente mais tarde.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-[#151823] border border-white/5">
          <CardHeader>
            <CardTitle className="text-neutral-100 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-viverblue" />
              Ferramentas Necessárias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-300 mb-2">
                Nenhuma ferramenta específica
              </h3>
              <p className="text-neutral-400 max-w-md mx-auto">
                Esta solução não requer ferramentas específicas para ser implementada. 
                Você pode começar imediatamente!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#151823] border border-white/5">
        <CardHeader>
          <CardTitle className="text-neutral-100 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-viverblue" />
            Ferramentas Necessárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-400 mb-6">
            Para implementar esta solução, você precisará das seguintes ferramentas. 
            As marcadas como obrigatórias são essenciais para o funcionamento.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            {tools.map((tool) => (
              <ToolItem key={tool.id} tool={tool} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
