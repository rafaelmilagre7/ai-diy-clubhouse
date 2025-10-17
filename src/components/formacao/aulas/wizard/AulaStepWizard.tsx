import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useAulaSteps from "@/hooks/useAulaSteps";
import { Loader2 } from "lucide-react";

// Serviços e hooks
import { useAulaForm } from "./hooks/useAulaForm";
import { useAulaStorage } from "./hooks/useAulaStorage";
import { saveLesson } from "./services/lessonService";
import { AulaFormValues } from "./schemas/aulaFormSchema";
import { DifficultyLevel } from "./types/aulaTypes";
import { LearningLesson, LearningModule } from "@/lib/supabase/types";

// Etapas do wizard
import EtapaInfoBasica from "./etapas/EtapaInfoBasica";
import EtapaMidia from "./etapas/EtapaMidia";
import EtapaVideos from "./etapas/EtapaVideos";
import EtapaMateriais from "./etapas/EtapaMateriais";
import EtapaPublicacao from "./etapas/EtapaPublicacao";

// Componente indicador de progresso
import WizardProgress from "./WizardProgress";

interface AulaStepWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aula?: LearningLesson | null;
  moduleId?: string | null;
  allowModuleSelection?: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
}

const AulaStepWizard: React.FC<AulaStepWizardProps> = ({
  open,
  onOpenChange,
  aula,
  moduleId,
  allowModuleSelection = false,
  onSuccess,
  onClose,
}) => {
  // Usar os hooks personalizados
  const {
    form,
    isSaving,
    setIsSaving,
    currentSaveStep,
    setCurrentSaveStep,
    modules,
    initialLoading,
    defaultValues
  } = useAulaForm(aula, moduleId, onSuccess);
  
  const {
    storageReady,
    storageChecking,
    storageError,
    retryStorageSetup
  } = useAulaStorage();
  
  // Usar o hook de etapas
  const { 
    currentStep, 
    stepTitles, 
    totalSteps, 
    nextStep, 
    prevStep, 
    goToStep 
  } = useAulaSteps(0);

  // Submeter o formulário
  const onSubmit = async (values: AulaFormValues) => {
    try {
      setIsSaving(true);
      
      const result = await saveLesson(values, aula?.id, setCurrentSaveStep);
      
      if (result.success) {
        if (result.message && result.message.includes("mas houve problemas")) {
          toast.warning(result.message);
        } else {
          toast.success(result.message || "Aula salva com sucesso!");
        }
        
        if (onSuccess) onSuccess();
        form.reset(defaultValues);
        onOpenChange(false);
        if (onClose) onClose();
      } else {
        toast.error(result.message || "Erro ao salvar aula.");
      }
    } catch (error: any) {
      console.error("Erro ao salvar aula:", error);
      toast.error(`Erro ao salvar aula: ${error.message || "Ocorreu um erro ao tentar salvar."}`);
    } finally {
      setIsSaving(false);
      setCurrentSaveStep("");
    }
  };

  // Função para renderizar a etapa atual
  const renderStep = () => {
    const formProps = {
      form,
      onNext: nextStep,
      onPrevious: prevStep,
      isSaving,
    };
    
    switch (currentStep) {
      case 0:
        return <EtapaInfoBasica 
          {...formProps} 
          modules={modules as LearningModule[]} 
          allowModuleSelection={allowModuleSelection}
        />;
      case 1:
        return <EtapaMidia {...formProps} />;
      case 2:
        return <EtapaVideos {...formProps} />;
      case 3:
        return <EtapaMateriais {...formProps} />;
      case 4:
        return <EtapaPublicacao {...formProps} onSubmit={() => form.handleSubmit(onSubmit)()} />;
      default:
        return <EtapaInfoBasica {...formProps} modules={modules as LearningModule[]} />;
    }
  };

  // Fechar o wizard
  const handleCancel = () => {
    form.reset(defaultValues);
    onOpenChange(false);
    if (onClose) onClose();
  };

  // Exibir aviso se houver problemas de armazenamento
  const renderStorageWarning = () => {
    if (storageChecking) {
      return (
        <div className="bg-operational/10 border border-operational/30 p-3 rounded-md mt-2 mb-4">
          <p className="text-operational text-sm flex items-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Verificando configuração de armazenamento...
          </p>
        </div>
      );
    }
    
    if (!storageReady) {
      return (
        <div className="bg-status-warning/10 border border-status-warning/30 p-3 rounded-md mt-2 mb-4">
          <div className="flex flex-col space-y-2">
            <p className="text-status-warning text-sm">
              <strong>Atenção:</strong> A configuração de armazenamento pode não estar completa. 
              Alguns recursos como upload de imagens e vídeos podem não funcionar corretamente.
            </p>
            <div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={retryStorageSetup} 
                className="text-xs"
              >
                Tentar configurar novamente
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (initialLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full max-w-3xl p-4 sm:p-6 flex items-center justify-center min-h-chart-md">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Carregando dados da aula...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl max-h-modal-lg overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{aula ? "Editar Aula" : "Criar Nova Aula"}</DialogTitle>
          <WizardProgress 
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepTitles={stepTitles}
            onStepClick={goToStep}
          />
        </DialogHeader>
        
        {renderStorageWarning()}
        
        {isSaving && (
          <div className="bg-operational/10 border border-operational/30 p-4 rounded-md mb-4 flex items-center space-x-3">
            <Loader2 className="h-4 w-4 animate-spin text-operational" />
            <p className="text-operational">
              {currentSaveStep || "Salvando aula..."}
            </p>
          </div>
        )}
        
        <form className="space-y-6">
          {renderStep()}
          
          {/* Navegação inferior - só aparece em algumas etapas */}
          {currentStep < 4 && (
            <div className="flex justify-between pt-4 border-t">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <div className="space-x-2">
                {currentStep > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={isSaving}
                  >
                    Voltar
                  </Button>
                )}
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={isSaving}
                >
                  {currentStep === totalSteps - 2 ? "Finalizar" : "Avançar"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AulaStepWizard;
