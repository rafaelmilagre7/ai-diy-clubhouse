
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { CreateInviteParams } from '@/hooks/admin/invites/types';
import { InviteBasicInfoStep } from './modal-steps/InviteBasicInfoStep';
import { InviteChannelsStep } from './modal-steps/InviteChannelsStep';
import { InviteSettingsStep } from './modal-steps/InviteSettingsStep';
import { InvitePreviewStep } from './modal-steps/InvitePreviewStep';

interface CreateInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (params: CreateInviteParams) => Promise<void>; // Mudando de onSubmit para onCreate
  isLoading: boolean;
}

const STEPS = [
  { key: 'basic', title: 'Informações Básicas', component: InviteBasicInfoStep },
  { key: 'channels', title: 'Canais', component: InviteChannelsStep },
  { key: 'settings', title: 'Configurações', component: InviteSettingsStep },
  { key: 'preview', title: 'Confirmação', component: InvitePreviewStep },
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
      setCurrentStep(0);
      setFormData({ channels: ['email'], expiresIn: '7 days' });
      onOpenChange(false);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Novo Convite - {STEPS[currentStep].title}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6 px-4">
          {STEPS.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index <= currentStep 
                  ? 'bg-viverblue text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div className={`
                  w-16 h-0.5 mx-2
                  ${index < currentStep ? 'bg-viverblue' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-1">
          <CurrentStepComponent 
            formData={formData} 
            onUpdate={updateFormData}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t bg-white flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
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
                className="flex items-center gap-2"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid() || isLoading}
                className="flex items-center gap-2 bg-viverblue hover:bg-viverblue/90"
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
      </DialogContent>
    </Dialog>
  );
};
