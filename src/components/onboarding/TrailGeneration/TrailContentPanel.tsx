
import React from "react";
import { Button } from "@/components/ui/button";
import { TrailSolutions } from "./TrailSolutions";
import { Loader2 } from "lucide-react";

interface TrailContentPanelProps {
  solutions: any[];
  generatingTrail: boolean;
  onBackToOnboarding: () => void;
  onStartTrailGeneration: () => void;
}

export const TrailContentPanel = ({
  solutions,
  generatingTrail,
  onBackToOnboarding,
  onStartTrailGeneration
}: TrailContentPanelProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={onBackToOnboarding}>
          Voltar para Onboarding
        </Button>
        <Button
          className="bg-[#0ABAB5] text-white"
          onClick={onStartTrailGeneration}
          disabled={generatingTrail}
        >
          {generatingTrail ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Gerando Nova Trilha...
            </>
          ) : "Gerar Nova Trilha"}
        </Button>
      </div>
      <TrailSolutions solutions={solutions} />
    </div>
  );
};
