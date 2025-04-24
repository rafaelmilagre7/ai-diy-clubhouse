
import React from "react";
import { Wrench } from "lucide-react";

export const ToolsEmptyState = () => {
  return (
    <div className="border rounded-lg p-6 text-center bg-muted/20">
      <div className="flex flex-col items-center justify-center">
        <Wrench className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium">Nenhuma ferramenta necessária</h3>
        <p className="text-muted-foreground mt-1">
          Esta solução não exige nenhuma ferramenta específica para ser implementada.
        </p>
      </div>
    </div>
  );
};
