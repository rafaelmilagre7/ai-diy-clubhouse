
import React from "react";
import { Solution } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SolutionFallbackContentProps {
  solution: Solution;
  onComplete: () => void;
}

export const SolutionFallbackContent = ({ solution, onComplete }: SolutionFallbackContentProps) => {
  const navigate = useNavigate();

  const renderContent = (content: string) => {
    return { __html: content };
  };

  const handleFinishImplementation = () => {
    onComplete();
    navigate("/dashboard");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header da solução */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-100">
          {solution.title}
        </h1>
        <p className="text-neutral-300 max-w-2xl mx-auto">
          {solution.description}
        </p>
      </div>

      {/* Conteúdo principal */}
      <Card className="bg-[#151823] border border-white/5">
        <CardContent className="p-8">
          <div className="prose max-w-none prose-invert">
            <h2 className="text-xl font-semibold mb-4 text-neutral-100">Sobre esta solução</h2>
            
            {solution.overview ? (
              <div 
                className="text-neutral-200 prose-headings:text-neutral-100 prose-p:text-neutral-200 prose-strong:text-neutral-100 prose-em:text-neutral-200 prose-li:text-neutral-200" 
                dangerouslySetInnerHTML={renderContent(solution.overview)} 
              />
            ) : (
              <p className="text-neutral-200">{solution.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card de finalização */}
      <Card className="bg-gradient-to-r from-viverblue/10 to-secondary/10 border border-viverblue/20">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-12 w-12 text-viverblue" />
            <h3 className="text-lg font-semibold text-neutral-100">
              Implementação Concluída
            </h3>
            <p className="text-neutral-300">
              Você visualizou todos os detalhes desta solução. Clique em finalizar para marcar como concluída.
            </p>
            <Button 
              onClick={handleFinishImplementation}
              className="bg-viverblue hover:bg-viverblue/90"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Finalizar Implementação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
