
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { WelcomeMessage } from "./WelcomeMessage";
import { ModulesList } from "./ModulesList";

interface LandingModuleProps {
  onComplete: () => void;
}

export const LandingModule = ({ onComplete }: LandingModuleProps) => {
  return (
    <div className="max-w-3xl mx-auto text-center space-y-8 py-12">
      <WelcomeMessage />
      <ModulesList activeModule={1} />
      <div className="pt-6">
        <Button size="lg" onClick={onComplete}>
          <ChevronRight className="mr-2 h-5 w-5" />
          Começar Implementação
        </Button>
      </div>
    </div>
  );
};
