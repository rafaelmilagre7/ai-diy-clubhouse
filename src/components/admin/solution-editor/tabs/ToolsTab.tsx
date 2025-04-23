
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToolsChecklist } from "@/hooks/useToolsChecklist";
import { Loader2, Save } from "lucide-react";
import { ToolSelector } from "@/components/admin/solution/form/ToolSelector";
import { toast } from "sonner";
import { SelectedTool } from "@/components/admin/solution/form/types";

interface ToolsTabProps {
  solution: any;
  onSubmit: (values: any) => Promise<void>;
  saving?: boolean;
}

const ToolsTab: React.FC<ToolsTabProps> = ({ solution, onSubmit, saving }) => {
  const { 
    tools, 
    setTools, 
    loading: loadingTools, 
    savingTools, 
    saveTools 
  } = useToolsChecklist(solution?.id || null);
  
  const handleSave = async () => {
    try {
      await saveTools();
      toast.success("Ferramentas salvas com sucesso");
      // Chamar o callback de onSubmit para atualizar a solução principal
      await onSubmit({});
    } catch (error) {
      console.error("Erro ao salvar ferramentas:", error);
      toast.error("Erro ao salvar ferramentas");
    }
  };

  if (loadingTools) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Carregando ferramentas...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-2">Ferramentas da Solução</h3>
        <p className="text-muted-foreground">
          Selecione as ferramentas que serão necessárias para implementar esta solução.
        </p>
      </div>

      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          <ToolSelector 
            value={tools} 
            onChange={(selectedTools: SelectedTool[]) => setTools(selectedTools)} 
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving || savingTools}
          className="gap-2"
        >
          {(saving || savingTools) && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          Salvar Ferramentas
        </Button>
      </div>
    </div>
  );
};

export default ToolsTab;
