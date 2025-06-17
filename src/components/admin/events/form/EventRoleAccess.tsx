
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { EventRoleCheckboxes } from "./EventRoleCheckboxes";
import { Users, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EventRoleAccessProps {
  selectedRoles: string[];
  onChange: (selectedIds: string[]) => void;
  isLoading?: boolean;
  isSaving?: boolean;
  error?: Error | null;
}

export const EventRoleAccess = ({ 
  selectedRoles, 
  onChange, 
  isLoading = false,
  isSaving = false,
  error = null
}: EventRoleAccessProps) => {
  const getStatusIcon = () => {
    if (isSaving) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (error) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (selectedRoles.length > 0) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Users className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (isSaving) return "Salvando configurações...";
    if (error) return `Erro: ${error.message}`;
    return "Controle de Acesso";
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm flex items-center gap-2">
        {getStatusIcon()}
        {getStatusText()}
      </h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-viverblue" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando configurações...</span>
        </div>
      ) : (
        <>
          <FormItem>
            <FormLabel>Acesso ao Evento</FormLabel>
            <EventRoleCheckboxes 
              selectedRoles={selectedRoles}
              onChange={onChange}
            />
            <FormMessage />
            
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao carregar ou salvar configurações de acesso: {error.message}
                </AlertDescription>
              </Alert>
            )}
            
            <Alert variant="default" className={`mt-2 ${
              selectedRoles.length > 0 
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' 
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }`}>
              <AlertDescription className={`text-sm ${
                selectedRoles.length > 0 
                  ? 'text-yellow-800 dark:text-yellow-200' 
                  : 'text-green-800 dark:text-green-200'
              }`}>
                {selectedRoles.length === 0 
                  ? "Evento público: Todos os usuários terão acesso a este evento."
                  : `Evento restrito: Apenas usuários com os papéis selecionados (${selectedRoles.length}) terão acesso.`
                }
              </AlertDescription>
            </Alert>
          </FormItem>
        </>
      )}
    </div>
  );
};
