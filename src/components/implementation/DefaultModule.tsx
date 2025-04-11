
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { ModuleTitle } from "./ModuleTitle";

interface DefaultModuleProps {
  module: any;
  onComplete: () => void;
}

export const DefaultModule = ({ module, onComplete }: DefaultModuleProps) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-12">
      <h2 className="text-2xl font-semibold">
        <ModuleTitle type={module.type} />
      </h2>
      <p className="text-muted-foreground">
        Conteúdo do módulo {module.type} - a ser implementado.
      </p>
      <div className="pt-6">
        <Button onClick={onComplete}>
          <CheckCircle className="mr-2 h-5 w-5" />
          Marcar como concluído e avançar
        </Button>
      </div>
    </div>
  );
};
