
import React from 'react';
import { Loader } from 'lucide-react';

interface AutoSaveFeedbackProps {
  isSaving: boolean;
  lastSaveTime: number | null;
}

export const AutoSaveFeedback: React.FC<AutoSaveFeedbackProps> = ({ isSaving, lastSaveTime }) => {
  if (!lastSaveTime && !isSaving) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      {isSaving ? (
        <>
          <Loader className="h-3 w-3 animate-spin" />
          <span>Salvando alterações...</span>
        </>
      ) : lastSaveTime ? (
        <span>
          Alterações salvas às{' '}
          {new Date(lastSaveTime).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      ) : null}
    </div>
  );
};
