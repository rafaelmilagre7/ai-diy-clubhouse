/**
 * Componente de loading especializado para criação de convites
 * Mostra progresso detalhado das etapas
 */

import React from 'react';
import { Clock, Mail, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface InviteCreationStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  duration?: number;
}

interface InviteCreationLoadingIndicatorProps {
  isVisible: boolean;
  currentStep?: string;
  progress?: number;
  email?: string;
  estimatedTime?: number;
}

export const InviteCreationLoadingIndicator: React.FC<InviteCreationLoadingIndicatorProps> = ({
  isVisible,
  currentStep = 'preparing',
  progress = 0,
  email,
  estimatedTime = 3000
}) => {
  const steps: InviteCreationStep[] = [
    { id: 'preparing', label: 'Preparando convite', status: 'pending' },
    { id: 'warming', label: 'Otimizando sistema', status: 'pending' },
    { id: 'generating', label: 'Gerando link seguro', status: 'pending' },
    { id: 'sending', label: 'Enviando email', status: 'pending' },
    { id: 'confirming', label: 'Confirmando entrega', status: 'pending' }
  ];

  // Atualizar status dos steps baseado no step atual
  const updatedSteps = steps.map((step, index) => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (index < currentIndex) {
      return { ...step, status: 'completed' as const };
    } else if (index === currentIndex) {
      return { ...step, status: 'active' as const };
    }
    return step;
  });

  const getStepIcon = (status: InviteCreationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'active':
        return <Zap className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Criando Convite
          </h3>
          {email && (
            <p className="text-sm text-gray-600">
              Para: <span className="font-medium">{email}</span>
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progresso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {updatedSteps.map((step, index) => (
            <div 
              key={step.id} 
              className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                step.status === 'active' ? 'bg-blue-50 border border-blue-200' : ''
              }`}
            >
              {getStepIcon(step.status)}
              <span className={`text-sm ${
                step.status === 'completed' ? 'text-green-700 font-medium' :
                step.status === 'active' ? 'text-blue-700 font-medium' :
                step.status === 'error' ? 'text-red-700 font-medium' :
                'text-gray-500'
              }`}>
                {step.label}
              </span>
              
              {step.status === 'active' && (
                <div className="flex-1 flex justify-end">
                  <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Estimated Time */}
        {estimatedTime > 0 && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Tempo estimado: ~{Math.round(estimatedTime / 1000)}s
            </p>
          </div>
        )}

        {/* Performance Tip */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <Zap className="w-3 h-3 inline mr-1" />
            Sistema otimizado para máxima velocidade
          </p>
        </div>
      </div>
    </div>
  );
};