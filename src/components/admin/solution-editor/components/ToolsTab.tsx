import React from "react";
import { Solution } from "@/types/solution";

export interface ToolsTabProps {
  solution: any;
  onSubmit: (values: any) => Promise<void>;
  saving: boolean;
}

const ToolsTab: React.FC<ToolsTabProps> = ({ solution, onSubmit, saving }) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Ferramentas Necessárias</h3>
      <p className="text-muted-foreground">
        Configure as ferramentas que serão necessárias para esta solução.
      </p>
      
      {/* Adicione aqui o formulário para gerenciar as ferramentas */}
      <div className="mt-8">
        <p className="text-sm text-muted-foreground">Ferramentas configuradas: {solution?.tools?.length || 0}</p>
      </div>
    </div>
  );
};

export default ToolsTab;
