
import React from 'react';
import { Loader, CheckCircle, Wifi, WifiOff } from 'lucide-react';

interface AutoSaveFeedbackProps {
  isSaving?: boolean;
  lastSaveTime?: number | null;
  hasUnsavedChanges?: boolean;
  isOnline?: boolean;
}

export const AutoSaveFeedback: React.FC<AutoSaveFeedbackProps> = ({ 
  isSaving = false, 
  lastSaveTime = null,
  hasUnsavedChanges = false,
  isOnline = true
}) => {
  // Se não há informações relevantes, não mostrar nada
  if (!lastSaveTime && !isSaving && !hasUnsavedChanges) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      {!isOnline && (
        <div className="flex items-center gap-1 text-red-400">
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </div>
      )}
      
      {isSaving ? (
        <div className="flex items-center gap-1 text-blue-400">
          <Loader className="h-3 w-3 animate-spin" />
          <span>Salvando...</span>
        </div>
      ) : lastSaveTime ? (
        <div className="flex items-center gap-1 text-green-400">
          <CheckCircle className="h-3 w-3" />
          <span>
            Salvo às{' '}
            {new Date(lastSaveTime).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      ) : hasUnsavedChanges ? (
        <div className="flex items-center gap-1 text-yellow-400">
          <Wifi className="h-3 w-3" />
          <span>Não salvo</span>
        </div>
      ) : null}
    </div>
  );
};
