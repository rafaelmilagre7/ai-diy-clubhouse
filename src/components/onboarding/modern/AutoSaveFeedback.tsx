
import React from 'react';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';

interface AutoSaveFeedbackProps {
  isSaving?: boolean;
  lastSaveTime?: number | null;
  hasUnsavedChanges?: boolean;
  isOnline?: boolean;
  hasError?: boolean;
}

export const AutoSaveFeedback: React.FC<AutoSaveFeedbackProps> = ({ 
  isSaving, 
  lastSaveTime,
  hasUnsavedChanges = false,
  isOnline = true,
  hasError = false
}) => {
  // Não mostrar nada se não estiver salvando e não tiver horário de último save
  if (!isSaving && !lastSaveTime && !hasError) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      {hasError ? (
        <>
          <AlertCircle className="h-3 w-3 text-red-500" />
          <span className="text-red-400">Erro ao salvar - dados serão salvos ao prosseguir</span>
        </>
      ) : isSaving ? (
        <>
          <Loader className="h-3 w-3 animate-spin" />
          <span>Salvando alterações...</span>
        </>
      ) : lastSaveTime ? (
        <>
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>
            Salvo às{' '}
            {new Date(lastSaveTime).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </>
      ) : null}
    </div>
  );
};
