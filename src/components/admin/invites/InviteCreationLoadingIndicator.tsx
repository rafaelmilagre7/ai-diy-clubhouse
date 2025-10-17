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
        return <CheckCircle className="w-4 h-4 text-status-success" />;
      case 'active':
        return <Zap className="w-4 h-4 text-status-info animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-status-error" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-status-info-lighter rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6 text-status-info" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Criando Convite
          </h3>
          {email && (
            <p className="text-sm text-muted-foreground">
              Para: <span className="font-medium">{email}</span>
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
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
              className={`flex items-center gap-3 p-2 rounded-lg transition-smooth ${
                step.status === 'active' ? 'bg-status-info-lighter border border-status-info/20' : ''
              }`}
            >
              {getStepIcon(step.status)}
              <span className={`text-sm ${
                step.status === 'completed' ? 'text-status-success font-medium' :
                step.status === 'active' ? 'text-status-info font-medium' :
                step.status === 'error' ? 'text-status-error font-medium' :
                'text-muted-foreground'
              }`}>
                {step.label}
              </span>
              
              {step.status === 'active' && (
                <div className="flex-1 flex justify-end">
                  <div className="w-4 h-4 border-2 border-status-info/20 border-t-status-info rounded-full animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Estimated Time */}
        {estimatedTime > 0 && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Tempo estimado: ~{Math.round(estimatedTime / 1000)}s
            </p>
          </div>
        )}

        {/* Performance Tip */}
        <div className="bg-status-info-lighter border border-status-info/20 rounded-lg p-3">
          <p className="text-xs text-status-info">
            <Zap className="w-3 h-3 inline mr-1" />
            Sistema otimizado para máxima velocidade
          </p>
        </div>
      </div>
    </div>
  );
};