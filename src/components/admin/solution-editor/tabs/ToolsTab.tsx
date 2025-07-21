
import React from "react";
import ToolsChecklistForm from "@/components/admin/solution/form/ToolsChecklistForm";
import { useToolsChecklist } from "@/hooks/useToolsChecklist";

interface ToolsTabProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ToolsTab: React.FC<ToolsTabProps> = ({
  solutionId,
  onSave,
  saving,
}) => {
  const { saveTools } = useToolsChecklist(solutionId);

  const handleSave = async () => {
    console.log("🔧 ToolsTab: Executando salvamento de ferramentas...");
    try {
      await saveTools();
      console.log("✅ ToolsTab: Ferramentas salvas com sucesso");
      onSave();
    } catch (error) {
      console.error("❌ ToolsTab: Erro ao salvar ferramentas:", error);
      throw error;
    }
  };

  return (
    <ToolsChecklistForm 
      solutionId={solutionId} 
      onSave={handleSave} 
      saving={saving} 
    />
  );
};

export default ToolsTab;
