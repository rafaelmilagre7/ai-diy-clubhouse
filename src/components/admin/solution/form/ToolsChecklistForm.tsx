
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ToolSelector } from "@/components/admin/solution/form/ToolSelector";
import { ToolsLoading } from "./components/ToolsLoading";
import { useToolsChecklist } from "@/hooks/useToolsChecklist";

interface ToolsChecklistFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ToolsChecklistForm: React.FC<ToolsChecklistFormProps> = ({
  solutionId,
  onSave,
  saving
}) => {
  const {
    tools,
    setTools,
    loading
  } = useToolsChecklist(solutionId);

  console.log("🔧 ToolsChecklistForm: Renderizando com:");
  console.log("📍 solutionId =", solutionId);
  console.log("🔧 loading =", loading);
  console.log("🔧 tools.length =", tools.length);

  if (loading) {
    return <ToolsLoading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Ferramentas Necessárias</h3>
        <p className="text-sm text-muted-foreground">
          Selecione as ferramentas que serão necessárias para implementar esta solução.
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <ToolSelector 
            value={tools} 
            onChange={setTools} 
          />
        </CardContent>
      </Card>
      
      <div className="text-sm text-muted-foreground">
        {tools.length === 0 
          ? "Nenhuma ferramenta selecionada" 
          : `${tools.length} ferramenta${tools.length > 1 ? 's' : ''} selecionada${tools.length > 1 ? 's' : ''}`
        }
      </div>
    </div>
  );
};

export default ToolsChecklistForm;
