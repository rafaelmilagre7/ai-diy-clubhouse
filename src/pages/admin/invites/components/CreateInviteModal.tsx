
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Mail, MessageSquare, Check, User, Settings, Eye } from 'lucide-react';
import { CreateInviteParams } from '@/hooks/admin/invites/types';
import { InviteBasicInfoStep } from './modal-steps/InviteBasicInfoStep';
import { InviteChannelsStep } from './modal-steps/InviteChannelsStep';
import { InviteSettingsStep } from './modal-steps/InviteSettingsStep';
import { InvitePreviewStep } from './modal-steps/InvitePreviewStep';
import { cn } from '@/lib/utils';

interface CreateInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateInvite: (params: CreateInviteParams) => Promise<void>;
  isCreating: boolean;
}

type InviteStep = 'basic' | 'channels' | 'settings' | 'preview';

const STEPS: { key: InviteStep; label: string; icon: React.ElementType }[] = [
  { key: 'basic', label: 'Informações Básicas', icon: User },
  { key: 'channels', label: 'Canais de Comunicação', icon: MessageSquare },
  { key: 'settings', label: 'Configurações', icon: Settings },
  { key: 'preview', label: 'Confirmação', icon: Eye }
];

export const CreateInviteModal = ({ open, onOpenChange, onCreateInvite, isCreating }: CreateInviteModalProps) => {
  const [currentStep, setCurrentStep] = useState<InviteStep>('basic');
  const [formData, setFormData] = useState<Partial<CreateInviteParams>>({
    channels: ['email'],
    expiresIn: '7 days'
  });

  const currentStepIndex = STEPS.findIndex(step => step.key === currentStep);
  const isLastStep = currentStep === 'preview';
  const isFirstStep = currentStep === 'basic';

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].key);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].key);
    }
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.roleId) return;
    
    await onCreateInvite(formData as CreateInviteParams);
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep('basic');
    setFormData({ channels: ['email'], expiresIn: '7 days' });
    onOpenChange(false);
  };

  const updateFormData = (updates: Partial<CreateInviteParams>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 'basic':
        return formData.email && formData.roleId;
      case 'channels':
        return formData.channels && formData.channels.length > 0;
      case 'settings':
        return true;
      case 'preview':
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-viverblue to-teal-600">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                Novo Convite
              </DialogTitle>
              <p className="text-cyan-100 text-sm mt-1">
                {STEPS[currentStepIndex].label}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.key === currentStep;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                      isActive && "bg-viverblue border-viverblue text-white",
                      isCompleted && "bg-green-500 border-green-500 text-white",
                      !isActive && !isCompleted && "bg-white border-gray-300 text-gray-400"
                    )}>
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs mt-2 font-medium text-center max-w-20",
                      isActive && "text-viverblue",
                      isCompleted && "text-green-600",
                      !isActive && !isCompleted && "text-gray-400"
                    )}>
                      {step.label}
                    </span>
                  </div>
                  
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      "h-0.5 w-16 mx-4 transition-all",
                      index < currentStepIndex ? "bg-green-500" : "bg-gray-300"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'basic' && (
            <InviteBasicInfoStep 
              formData={formData}
              onUpdate={updateFormData}
            />
          )}
          
          {currentStep === 'channels' && (
            <InviteChannelsStep 
              formData={formData}
              onUpdate={updateFormData}
            />
          )}
          
          {currentStep === 'settings' && (
            <InviteSettingsStep 
              formData={formData}
              onUpdate={updateFormData}
            />
          )}
          
          {currentStep === 'preview' && (
            <InvitePreviewStep formData={formData} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Etapa {currentStepIndex + 1} de {STEPS.length}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="min-w-20"
            >
              Anterior
            </Button>
            
            {!isLastStep ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="min-w-20"
              >
                Próximo
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || isCreating}
                className="min-w-32"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Convite
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
