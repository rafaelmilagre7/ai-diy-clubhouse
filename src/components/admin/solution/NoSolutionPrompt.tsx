
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Save } from "lucide-react";

interface NoSolutionPromptProps {
  onSave: () => void;
  saving: boolean;
}

const NoSolutionPrompt: React.FC<NoSolutionPromptProps> = ({ onSave, saving }) => {
  return (
    <div className="flex flex-col items-center">
      <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
      <p className="text-sm">
        Você precisa salvar a solução primeiro para configurar os módulos.
      </p>
      <Button 
        type="button"
        onClick={onSave}
        className="mt-4"
        disabled={saving}
      >
        <Save className="mr-2 h-4 w-4" />
        Salvar Solução
      </Button>
    </div>
  );
};

export default NoSolutionPrompt;
