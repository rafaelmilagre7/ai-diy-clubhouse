
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GenerationControlsProps {
  onGoBack: () => void;
  onRegenerate: () => void;
  generating: boolean;
}

export const GenerationControls: React.FC<GenerationControlsProps> = ({
  onGoBack,
  onRegenerate,
  generating,
}) => (
  <div className="mb-6 flex justify-between items-center">
    <Button variant="outline" onClick={onGoBack}>
      Voltar para Onboarding
    </Button>
    <Button
      className="bg-[#0ABAB5] text-white"
      onClick={onRegenerate}
      disabled={generating}
    >
      {generating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Gerando Nova Trilha...
        </>
      ) : "Gerar Nova Trilha"}
    </Button>
  </div>
);
