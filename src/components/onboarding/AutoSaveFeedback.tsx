
import React from 'react';
import { Loader, CheckCircle } from 'lucide-react';

interface AutoSaveFeedbackProps {
  isSaving: boolean;
  lastSaveTime: number | null;
  showSuccess?: boolean;
}

export const AutoSaveFeedback: React.FC<AutoSaveFeedbackProps> = ({ 
  isSaving, 
  lastSaveTime, 
  showSuccess = true 
}) => {
  // Só mostrar feedback quando estiver salvando ou se explicitamente solicitado
  if (!isSaving && (!lastSaveTime || !showSuccess)) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      {isSaving ? (
        <>
          <Loader className="h-3 w-3 animate-spin" />
          <span>Salvando...</span>
        </>
      ) : lastSaveTime && showSuccess ? (
        <>
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>Salvo com sucesso</span>
        </>
      ) : null}
    </div>
  );
};
