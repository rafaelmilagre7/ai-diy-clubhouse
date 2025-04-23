
import React from "react";
import { FileX } from "lucide-react";

export const MaterialsEmptyState = () => {
  return (
    <div className="text-center py-8 bg-gray-50 rounded-lg">
      <div className="flex justify-center mb-2">
        <FileX className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <p className="text-muted-foreground">Nenhum material disponível para esta solução.</p>
    </div>
  );
};
