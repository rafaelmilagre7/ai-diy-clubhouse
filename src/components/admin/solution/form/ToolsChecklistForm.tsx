
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";
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
    loading,
    savingTools,
    saveTools
  } = useToolsChecklist(solutionId);

  // Escutar eventos de salvamento e validação
  useEffect(() => {
    const handleSaveStep = async (event: CustomEvent) => {
      try {
        await handleSaveTools();
        
        // Disparar evento de confirmação
        const savedEvent = new CustomEvent('tools-saved', {
          detail: { success: true }
        });
        window.dispatchEvent(savedEvent);
      } catch (error) {
        console.error("Erro ao salvar ferramentas:", error);
        
        // Disparar evento de erro
        const errorEvent = new CustomEvent('tools-saved', {
          detail: { 
            success: false, 
            error: error instanceof Error ? error.message : "Erro ao salvar ferramentas"
          }
        });
        window.dispatchEvent(errorEvent);
      }
    };

    const handleValidateStep = () => {
      // Validar se tem pelo menos uma ferramenta selecionada
      const isValid = tools.length > 0;
      
      const validateEvent = new CustomEvent('tools-validated', {
        detail: { 
          valid: isValid,
          message: isValid ? "Ferramentas válidas" : "Selecione pelo menos uma ferramenta"
        }
      });
      window.dispatchEvent(validateEvent);
    };

    window.addEventListener('save-tools-step', handleSaveStep as EventListener);
    window.addEventListener('validate-tools-step', handleValidateStep as EventListener);
    
    return () => {
      window.removeEventListener('save-tools-step', handleSaveStep as EventListener);
      window.removeEventListener('validate-tools-step', handleValidateStep as EventListener);
    };
  }, [tools, saveTools]);

  const handleSaveTools = async () => {
    try {
      await saveTools();
      onSave();
    } catch (error) {
      console.error("Erro ao salvar ferramentas:", error);
      throw error;
    }
  };

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
      
      <Button 
        onClick={handleSaveTools}
        disabled={savingTools || saving}
        className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
      >
        {savingTools ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Salvar e Continuar
          </>
        )}
      </Button>
    </div>
  );
};

export default ToolsChecklistForm;
