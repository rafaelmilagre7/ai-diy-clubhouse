
import React, { useState, useEffect } from "react";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { Loader2 } from "lucide-react";
import { TrailSolutions } from "./TrailGeneration/TrailSolutions";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TrailGenerationPanelProps {
  onboardingData?: any;
  onClose?: () => void;
}

export const TrailGenerationPanel: React.FC<TrailGenerationPanelProps> = ({ onboardingData, onClose }) => {
  const navigate = useNavigate();
  const { trail, isLoading, error, refreshTrail, generateImplementationTrail } = useImplementationTrail();
  const { solutions: allSolutions, loading: solutionsLoading } = useSolutionsData();
  const [processedSolutions, setProcessedSolutions] = useState<any[]>([]);

  // Processar soluções da trilha quando os dados estiverem disponíveis
  useEffect(() => {
    const processSolutions = () => {
      if (!trail || !allSolutions?.length) {
        setProcessedSolutions([]);
        return;
      }

      const result = [];
      
      ["priority1", "priority2", "priority3"].forEach((priority, idx) => {
        const items = (trail as any)[priority] || [];
        items.forEach((item: any) => {
          const solution = allSolutions.find(s => s.id === item.solutionId);
          if (solution) {
            result.push({
              ...solution,
              ...item,
              priority: idx + 1
            });
          }
        });
      });

      setProcessedSolutions(result);
    };

    processSolutions();
  }, [trail, allSolutions]);

  // Função para regenerar a trilha
  const handleRegenerate = async () => {
    try {
      await generateImplementationTrail(onboardingData || {});
    } catch (error) {
      console.error("Erro ao regenerar trilha:", error);
    }
  };

  if (isLoading || solutionsLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin" />
        <span className="text-[#0ABAB5] font-medium">
          Carregando sua trilha personalizada...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro ao carregar trilha</AlertTitle>
        <AlertDescription>
          <p>Não foi possível carregar sua trilha personalizada. Por favor, entre em contato com o suporte.</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mt-4"
          >
            Ir para Dashboard
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-extrabold text-[#0ABAB5] text-center">
        Sua Trilha Personalizada VIVER DE IA
      </h2>
      <TrailSolutions 
        solutions={processedSolutions} 
        onRegenerate={handleRegenerate} 
        onClose={onClose} 
      />
    </div>
  );
};
