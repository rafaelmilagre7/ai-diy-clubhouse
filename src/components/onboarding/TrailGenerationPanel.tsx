
import React, { useState } from "react";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { TrailCardList } from "@/components/dashboard/TrailCardList";
import { Button } from "@/components/ui/button";
import { Edit, Loader2, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { TrailMagicExperience } from "./TrailMagicExperience";

export const TrailGenerationPanel = ({ onClose }: { onClose?: () => void }) => {
  const { trail, isLoading, generateImplementationTrail } = useImplementationTrail();
  const [regenerating, setRegenerating] = useState(false);
  const [showMagic, setShowMagic] = useState(false);
  const navigate = useNavigate();

  // Montar soluções da trilha
  let solutions: any[] = [];
  if (trail) {
    // Unifica todas prioridades em lista única para o TrailCardList
    ["priority1", "priority2", "priority3"].forEach((priorityLevel, idx) => {
      const items = (trail as any)[priorityLevel] || [];
      items.forEach((item) => {
        solutions.push({
          ...item,
          priority: idx + 1,
        });
      });
    });
  }

  // Nova função de geração que exibe a experiência mágica
  const handleRegenerate = async () => {
    setShowMagic(true);
    setRegenerating(true);
    await generateImplementationTrail(); // Já busca soluções mais atuais automaticamente!
    setRegenerating(false);
    // O TrailMagicExperience vai chamar onFinish() quando a experiência acabar (ver abaixo).
  };

  // Quando terminar a mágica, esconder overlay e mostrar trilha.
  const handleFinishMagic = () => {
    setShowMagic(false);
  };

  if ((isLoading || regenerating) && !showMagic) {
    // Esse estado só será mostrado se for carregamento inicial e não a experiência mágica
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin" />
        <span className="text-[#0ABAB5] font-medium">Milagrinho está preparando sua trilha personalizada...</span>
      </div>
    );
  }

  if (showMagic) {
    return <TrailMagicExperience onFinish={handleFinishMagic} />;
  }

  if (!trail || solutions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <span>Nenhuma trilha personalizada foi gerada ainda.</span>
        <Button
          onClick={handleRegenerate}
          className="bg-[#0ABAB5] text-white"
        >
          Gerar Trilha Personalizada
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-[#0ABAB5]/10 to-white border-[#0ABAB5]/15">
      <CardHeader>
        <CardTitle className="text-2xl text-[#0ABAB5]">
          Sua Trilha Personalizada
        </CardTitle>
        <CardDescription>
          Estas são as soluções que vão gerar mais resultado de acordo com seu perfil!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TrailCardList
          solutions={solutions}
          onSolutionClick={(id) => navigate(`/solution/${id}`)}
          onSeeAll={() => navigate("/solutions")}
        />
        <div className="flex justify-between mt-6">
          <Button variant="ghost" onClick={handleRegenerate}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Regenerar Trilha
          </Button>
          <Button variant="outline" onClick={() => navigate("/onboarding/review")}>
            <Edit className="h-4 w-4 mr-2" /> Editar Onboarding
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
