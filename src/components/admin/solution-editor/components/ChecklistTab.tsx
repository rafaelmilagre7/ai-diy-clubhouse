
import React from "react";
import { Solution } from "@/types/solution";

export interface ChecklistTabProps {
  solution: any;
  onSubmit: (values: any) => Promise<void>;
  saving: boolean;
}

const ChecklistTab: React.FC<ChecklistTabProps> = ({ solution, onSubmit, saving }) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Checklist de Implementação</h3>
      <p className="text-muted-foreground">
        Configure os itens de checklist que o usuário precisará completar para implementar esta solução.
      </p>
      
      {/* Adicione aqui o formulário para gerenciar o checklist */}
      <div className="mt-8">
        <p className="text-sm text-muted-foreground">Itens de checklist configurados: {solution?.checklist_items?.length || 0}</p>
      </div>
    </div>
  );
};

export default ChecklistTab;
