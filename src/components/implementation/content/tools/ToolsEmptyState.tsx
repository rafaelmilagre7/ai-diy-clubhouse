
import React from "react";
import { Wrench } from "lucide-react";

export const ToolsEmptyState = () => {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
        <Wrench className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium mb-2">Nenhuma ferramenta necessária</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Esta solução não requer ferramentas específicas para implementação.
      </p>
    </div>
  );
};
