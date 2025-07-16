import React from 'react';
import { Card } from '@/components/ui/card';

interface OnboardingDebugPanelProps {
  data: any;
  isSaving: boolean;
  isLoading: boolean;
}

export const OnboardingDebugPanel: React.FC<OnboardingDebugPanelProps> = ({
  data,
  isSaving,
  isLoading
}) => {
  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 w-80 z-50 bg-gray-900 text-white text-xs">
      <h4 className="font-bold mb-2">🐛 Debug Onboarding</h4>
      <div className="space-y-1">
        <div>
          <span className="text-yellow-400">Status:</span>
          <span className={`ml-1 ${isSaving ? 'text-red-400' : 'text-green-400'}`}>
            {isSaving ? 'Salvando...' : isLoading ? 'Carregando...' : 'Pronto'}
          </span>
        </div>
        <div>
          <span className="text-yellow-400">Step atual:</span>
          <span className="ml-1">{data?.current_step || 'N/A'}</span>
        </div>
        <div>
          <span className="text-yellow-400">Completados:</span>
          <span className="ml-1">{JSON.stringify(data?.completed_steps || [])}</span>
        </div>
        <div>
          <span className="text-yellow-400">Dados pessoais:</span>
          <div className="ml-2 text-xs text-gray-300">
            Nome: {data?.personal_info?.name || 'Vazio'}
          </div>
          <div className="ml-2 text-xs text-gray-300">
            Email: {data?.personal_info?.email || 'Vazio'}
          </div>
        </div>
        <div>
          <span className="text-yellow-400">Completo:</span>
          <span className={`ml-1 ${data?.is_completed ? 'text-green-400' : 'text-red-400'}`}>
            {data?.is_completed ? 'Sim' : 'Não'}
          </span>
        </div>
      </div>
    </Card>
  );
};