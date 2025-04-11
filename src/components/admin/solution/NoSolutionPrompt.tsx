
import React from "react";
import { Button } from "@/components/ui/button";

interface NoSolutionPromptProps {
  onSave: () => void;
  saving: boolean;
}

const NoSolutionPrompt: React.FC<NoSolutionPromptProps> = ({ onSave, saving }) => {
  return (
    <div className="text-center p-6 border-2 border-dashed rounded-md">
      <p className="text-muted-foreground mb-4">
        Para começar a criar módulos, primeiro salve as informações básicas da solução.
      </p>
      <Button
        onClick={onSave}
        disabled={saving}
        className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
      >
        {saving ? "Salvando..." : "Salvar Solução"}
      </Button>
    </div>
  );
};

export default NoSolutionPrompt;
