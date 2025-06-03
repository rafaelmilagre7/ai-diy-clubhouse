
import React from "react";
import { BookOpen } from "lucide-react";

export const SolutionModulesEmpty = () => {
  return (
    <div className="text-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-backgroundLight rounded-full flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-textPrimary mb-2">
            Nenhum módulo encontrado
          </h3>
          <p className="text-textSecondary">
            Esta solução ainda não possui módulos estruturados.
          </p>
        </div>
      </div>
    </div>
  );
};
