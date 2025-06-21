
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { ModernProgressIndicator } from './ui/ModernProgressIndicator';
import { InviteBasicInfoStep } from './modal-steps/InviteBasicInfoStep';
import { InviteChannelsStep } from './modal-steps/InviteChannelsStep';
import { InviteSettingsStep } from './modal-steps/InviteSettingsStep';
import { InvitePreviewStep } from './modal-steps/InvitePreviewStep';
import { CreateInviteParams } from '@/hooks/admin/invites/types';

interface CreateInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (params: CreateInviteParams) => Promise<void>;
  isLoading: boolean;
}

const steps = [
  { key: 'basic', title: 'Dados Básicos', icon: '👤', description: 'Informações do convidado' },
  { key: 'channels', title: 'Canais', icon: '📧', description: 'Como enviar o convite' },
  { key: 'settings', title: 'Configurações', icon: '⚙️', description: 'Prazo e observações' },
  { key: 'preview', title: 'Revisar', icon: '👁️', description: 'Confirmar dados' }
];

export const CreateInviteModal = ({ open, onOpenChange, onCreate, isLoading }: CreateInviteModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<CreateInviteParams>>({
    channels: ['email'],
    expiresIn: '7 days'
  });

  const handleNext = () => {
    // Validações por etapa
    if (currentStep === 0) {
      if (!formData.email || !formData.roleId) {
        toast.error('Preencha o email e selecione uma função');
        return;
      }
    }
    
    if (currentStep === 1) {
      if (!formData.channels || formData.channels.length === 0) {
        toast.error('Selecione pelo menos um canal de envio');
        return;
      }
      
      // Validação específica para WhatsApp
      if (formData.channels.includes('whatsapp')) {
        if (!formData.userName || formData.userName.trim() === '') {
          toast.error('Nome da pessoa é obrigatório para envio via WhatsApp');
          return;
        }
        if (!formData.whatsappNumber || formData.whatsappNumber.trim() === '') {
          toast.error('Número do WhatsApp é obrigatório');
          return;
        }
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validação final
      if (!formData.email || !formData.roleId) {
        toast.error('Dados básicos incompletos');
        return;
      }

      if (formData.channels?.includes('whatsapp')) {
        if (!formData.userName || formData.userName.trim() === '') {
          toast.error('Nome da pessoa é obrigatório para WhatsApp');
          return;
        }
        if (!formData.whatsappNumber || formData.whatsappNumber.trim() === '') {
          toast.error('Número do WhatsApp é obrigatório');
          return;
        }
      }

      await onCreate(formData as CreateInviteParams);
      handleClose();
    } catch (error: any) {
      console.error('Erro ao criar convite:', error);
      toast.error(error.message || 'Erro ao criar convite');
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setFormData({
      channels: ['email'],
      expiresIn: '7 days'
    });
    onOpenChange(false);
  };

  const updateFormData = (updates: Partial<CreateInviteParams>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.email && formData.roleId;
      case 1:
        const hasChannels = formData.channels && formData.channels.length > 0;
        const whatsappValid = !formData.channels?.includes('whatsapp') || 
          (formData.userName?.trim() && formData.whatsappNumber?.trim());
        return hasChannels && whatsappValid;
      case 2:
        return true;
      default:
        return true;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <InviteBasicInfoStep formData={formData} onUpdate={updateFormData} />;
      case 1:
        return <InviteChannelsStep formData={formData} onUpdate={updateFormData} />;
      case 2:
        return <InviteSettingsStep formData={formData} onUpdate={updateFormData} />;
      case 3:
        return <InvitePreviewStep formData={formData} onUpdate={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-[#0F1419] border-neutral-800 text-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">Criar Novo Convite</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-neutral-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-shrink-0 py-6">
          <ModernProgressIndicator
            steps={steps}
            currentStep={currentStep}
            onStepClick={(stepIndex) => {
              if (stepIndex <= currentStep) {
                setCurrentStep(stepIndex);
              }
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {renderCurrentStep()}
        </div>

        <div className="flex-shrink-0 flex justify-between pt-6 border-t border-neutral-800">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Cancelar
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-white"
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !canProceed()}
                className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-white"
              >
                {isLoading ? 'Criando...' : 'Criar Convite'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
