
import React from "react";
import { FileText, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useModuleContext } from "./ModuleContext";
import { MODULE_TYPE_MAPPING } from "./moduleConstants";

interface ModuleEmptyStateProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
  onCreateModule: () => void;
  currentModuleStep?: number;
}

const ModuleEmptyState: React.FC<ModuleEmptyStateProps> = ({
  solutionId,
  onSave,
  saving,
  onCreateModule,
  currentModuleStep = -1
}) => {
  const { modules, isLoading, handleCreateDefaultModules } = useModuleContext();

  return (
    <div className="text-center py-8">
      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold">Módulos da Solução</h3>
      <p className="text-muted-foreground mt-2 max-w-md mx-auto">
        {solutionId ? 
          "Gerencie os módulos da sua solução abaixo ou adicione novos módulos." :
          "Primeiramente, salve as informações básicas da solução antes de configurar os módulos detalhados."}
      </p>
      
      {currentModuleStep >= 0 && !modules.find(m => m.type === MODULE_TYPE_MAPPING[currentModuleStep]) && (
        <Alert variant="default" className="mt-4 bg-amber-50 border-amber-200 text-left">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Módulo ainda não criado</AlertTitle>
          <AlertDescription>
            O módulo "{MODULE_TYPE_MAPPING[currentModuleStep]}" ainda não foi criado. 
            Clique em "Criar Estrutura Padrão" para criar todos os módulos ou crie este módulo específico.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mt-6">
        {solutionId ? (
          <>
            {modules.length < 8 && (
              <Button 
                onClick={onCreateModule} 
                className="mt-4 bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Módulo
              </Button>
            )}
            
            {modules.length === 0 && !isLoading && (
              <Button 
                onClick={() => handleCreateDefaultModules()} 
                className="mt-4 bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
              >
                Criar Estrutura Padrão (8 Módulos)
              </Button>
            )}
          </>
        ) : (
          <NoSolutionPrompt onSave={onSave} saving={saving} />
        )}
      </div>
    </div>
  );
};

const NoSolutionPrompt: React.FC<{ onSave: () => void; saving: boolean }> = ({
  onSave,
  saving
}) => {
  return (
    <div className="text-center p-6 border-2 border-dashed rounded-md">
      <p className="text-muted-foreground mb-4">
        Para começar a criar módulos, primeiro salve as informações básicas da solução.
      </p>
      <Button
        onClick={onSave}
        disabled={saving}
        className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
      >
        {saving ? "Salvando..." : "Salvar Solução"}
      </Button>
    </div>
  );
};

export default ModuleEmptyState;
