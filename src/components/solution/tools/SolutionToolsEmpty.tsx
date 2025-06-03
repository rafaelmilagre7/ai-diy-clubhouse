
import React from "react";
import { Wrench } from "lucide-react";

export const SolutionToolsEmpty = () => {
  return (
    <div className="text-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-backgroundLight rounded-full flex items-center justify-center">
          <Wrench className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-textPrimary mb-2">
            Nenhuma ferramenta cadastrada
          </h3>
          <p className="text-textSecondary">
            Esta solução não requer ferramentas específicas ou ainda não foram cadastradas.
          </p>
        </div>
      </div>
    </div>
  );
};
