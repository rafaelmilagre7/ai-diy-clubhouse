
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Send, X } from 'lucide-react';
import { CreateInviteParams } from '@/hooks/admin/invites/types';
import { InviteBasicInfoStep } from './modal-steps/InviteBasicInfoStep';
import { InviteChannelsStep } from './modal-steps/InviteChannelsStep';
import { InviteSettingsStep } from './modal-steps/InviteSettingsStep';
import { InvitePreviewStep } from './modal-steps/InvitePreviewStep';
import { ModernProgressIndicator } from './ui/ModernProgressIndicator';

interface CreateInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (params: CreateInviteParams) => Promise<void>;
  isLoading: boolean;
}

const STEPS = [
  { 
    key: 'basic', 
    title: 'Informações Básicas', 
    component: InviteBasicInfoStep,
    icon: 'user',
    description: 'Dados do convidado'
  },
  { 
    key: 'channels', 
    title: 'Canais', 
    component: InviteChannelsStep,
    icon: 'message-circle',
    description: 'Como enviar o convite'
  },
  { 
    key: 'settings', 
    title: 'Configurações', 
    component: InviteSettingsStep,
    icon: 'settings',
    description: 'Prazo e observações'
  },
  { 
    key: 'preview', 
    title: 'Confirmação', 
    component: InvitePreviewStep,
    icon: 'check-circle',
    description: 'Revisar informações'
  },
];

export const CreateInviteModal = ({ open, onOpenChange, onCreate, isLoading }: CreateInviteModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<CreateInviteParams>>({
    channels: ['email'],
    expiresIn: '7 days'
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.email || !formData.roleId) {
        return;
      }

      await onCreate(formData as CreateInviteParams);
      handleClose();
    } catch (error) {
      console.error('Erro ao criar convite:', error);
    }
  };

  const updateFormData = (updates: Partial<CreateInviteParams>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const isFormValid = () => {
    return formData.email && formData.roleId;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basic info
        return formData.email && formData.roleId;
      case 1: // Channels
        const hasWhatsApp = formData.channels?.includes('whatsapp');
        return hasWhatsApp ? formData.whatsappNumber : true;
      default:
        return true;
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  const handleClose = () => {
    setCurrentStep(0);
    setFormData({ channels: ['email'], expiresIn: '7 days' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-white border-0 shadow-2xl">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 border-b border-gray-100 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Novo Convite
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                {STEPS[currentStep].description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex-shrink-0 py-6">
          <ModernProgressIndicator
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={(stepIndex) => {
              if (stepIndex < currentStep || (stepIndex === currentStep + 1 && canProceed())) {
                setCurrentStep(stepIndex);
              }
            }}
          />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-1 pb-6">
          <div className="min-h-[400px]">
            <CurrentStepComponent 
              formData={formData} 
              onUpdate={updateFormData}
            />
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex-shrink-0 border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 text-gray-600 border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>

            <div className="flex items-center gap-3">
              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-white px-6"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isLoading}
                  className="flex items-center gap-2 bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-white px-6"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar Convite
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
