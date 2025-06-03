
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSolutionData } from "@/hooks/useSolutionData";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/transitions/PageTransition";
import { FadeTransition } from "@/components/transitions/FadeTransition";

const SolutionImplementation = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const {
    solution,
    loading,
    error
  } = useSolutionData(id);
  
  useEffect(() => {
    if (solution) {
      console.log("Solution loaded for implementation", { 
        solution_id: solution.id,
        solution_title: solution.title,
        category: solution.category,
        difficulty: solution.difficulty
      });
    }
  }, [solution]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (error || !solution) {
    return (
      <PageTransition className="min-h-screen bg-[#0F111A] pb-16">
        <div className="container max-w-4xl py-4 md:py-6 animate-fade-in">
          <GlassCard className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Solução não encontrada</h2>
            <p className="text-muted-foreground">
              A solução que você está procurando não foi encontrada ou não está disponível.
            </p>
          </GlassCard>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-[#0F111A] pb-16">
      <div className="container max-w-4xl py-4 md:py-6 animate-fade-in">
        <GlassCard className="p-0 md:p-0 transition-all duration-300 shadow-xl border border-white/10 overflow-hidden">
          {/* Header da solução */}
          <CardHeader className="bg-gradient-to-r from-[#0ABAB5] to-[#0ABAB5]/80 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">{solution.title}</CardTitle>
                <p className="text-white/90 mt-2">{solution.description}</p>
              </div>
              <div className="flex flex-col gap-2">
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
              </div>
            </div>
          </CardHeader>
          
          {/* Conteúdo principal */}
          <CardContent className="p-6">
            <FadeTransition>
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-4">Implementação Simplificada</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Esta solução foi simplificada para focar no essencial. 
                  Utilize as ferramentas, materiais e recursos fornecidos para implementar esta solução em seu negócio.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Ferramentas</h4>
                    <p className="text-sm text-muted-foreground">
                      Acesse as ferramentas recomendadas para esta solução
                    </p>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Materiais</h4>
                    <p className="text-sm text-muted-foreground">
                      Baixe templates e recursos complementares
                    </p>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Vídeos</h4>
                    <p className="text-sm text-muted-foreground">
                      Assista aos vídeos explicativos da solução
                    </p>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Checklist</h4>
                    <p className="text-sm text-muted-foreground">
                      Siga o checklist para implementação completa
                    </p>
                  </Card>
                </div>
              </div>
            </FadeTransition>
          </CardContent>
        </GlassCard>
      </div>
    </PageTransition>
  );
};

export default SolutionImplementation;
