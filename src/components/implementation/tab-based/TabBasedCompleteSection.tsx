
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Award, ArrowRight } from "lucide-react";
import { Solution, Progress } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface TabBasedCompleteSectionProps {
  solutionId: string;
  solution: Solution;
  progress: Progress | null;
  onComplete: () => Promise<boolean>;
}

export const TabBasedCompleteSection = ({ 
  solutionId, 
  solution, 
  progress, 
  onComplete 
}: TabBasedCompleteSectionProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async () => {
    setIsCompleting(true);
    const success = await onComplete();
    
    if (success) {
      // Redirecionar para página de certificado ou sucesso
      setTimeout(() => {
        navigate(`/solution/${solutionId}?completed=true`);
      }, 2000);
    }
    
    setIsCompleting(false);
  };

  if (progress?.is_completed) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <Award className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-green-800">
              Implementação Concluída!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-green-700 mb-6">
              Parabéns! Você concluiu com sucesso a implementação de <strong>{solution.title}</strong>.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => navigate(`/solution/${solutionId}`)}
                variant="outline"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Voltar à Solução
              </Button>
              
              <Button 
                onClick={() => navigate("/solutions")}
                className="bg-viverblue hover:bg-viverblue-dark"
              >
                Explorar Mais Soluções
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Finalizar Implementação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Pronto para concluir?</h3>
            <p className="text-muted-foreground mb-4">
              Ao finalizar a implementação de <strong>{solution.title}</strong>, você estará 
              marcando esta solução como completamente implementada em seu negócio.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Antes de concluir, certifique-se de que:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✓ Você revisou todas as ferramentas necessárias</li>
              <li>✓ Baixou todos os materiais relevantes</li>
              <li>✓ Assistiu aos vídeos explicativos</li>
              <li>✓ Completou os itens do checklist</li>
              <li>✓ A solução está funcionando em seu negócio</li>
            </ul>
          </div>

          <Button 
            onClick={handleComplete}
            disabled={isCompleting}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            {isCompleting ? "Finalizando..." : "Concluir Implementação"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
