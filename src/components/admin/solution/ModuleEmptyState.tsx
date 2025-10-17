import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import NoSolutionPrompt from './NoSolutionPrompt';
interface ModuleEmptyStateProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
  onCreateModule: () => void;
  currentModuleStep: number;
  handleCreateDefaultModules: (specificTypes?: string[]) => Promise<void>;
}
const ModuleEmptyState: React.FC<ModuleEmptyStateProps> = ({
  solutionId,
  onSave,
  saving,
  onCreateModule,
  currentModuleStep,
  handleCreateDefaultModules
}) => {
  // Ações para criar todos os módulos padrão ou continuar com a criação individual
  const handleCreateAll = async () => {
    if (!solutionId) return;
    await handleCreateDefaultModules();
    onSave();
  };

  // Se não temos ID de solução, mostrar prompt para salvar informações básicas primeiro
  if (!solutionId) {
    return <NoSolutionPrompt onSave={onSave} saving={saving} />;
  }
  return <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <h3 className="text-xl font-medium mb-3">Nenhum módulo criado</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Módulos são as etapas da jornada de implementação da sua solução de IA.
        Cada módulo tem um propósito específico para guiar os membros.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Button onClick={onCreateModule} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Módulo Individual
        </Button>
        <Button variant="outline" onClick={handleCreateAll} className="gap-2">
          Criar Todos os Módulos Padrão
        </Button>
      </div>

      <Alert variant="default" className="border-operational/20 bg-card">
        <AlertCircle className="h-4 w-4 text-operational" />
        <AlertTitle className="text-foreground">Dica</AlertTitle>
        <AlertDescription className="text-sm text-left">
          Recomendamos seguir o fluxo de módulos padrão para garantir uma
          experiência completa para seus membros. Comece com a Landing e termine
          com a Celebração.
        </AlertDescription>
      </Alert>
    </div>;
};
export default ModuleEmptyState;