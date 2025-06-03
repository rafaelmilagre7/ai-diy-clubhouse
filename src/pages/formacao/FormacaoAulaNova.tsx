
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AulaStepWizard from '@/components/formacao/aulas/wizard/AulaStepWizard';

const FormacaoAulaNova = () => {
  const navigate = useNavigate();
  const [wizardOpen, setWizardOpen] = useState(true);

  // Função para voltar à página anterior
  const handleGoBack = () => {
    navigate('/formacao/aulas');
  };

  // Função chamada quando a criação é concluída com sucesso
  const handleCreateSuccess = () => {
    toast.success("Aula criada com sucesso!");
    navigate('/formacao/aulas');
  };

  // Função para fechar o wizard e voltar
  const handleWizardClose = () => {
    setWizardOpen(false);
    handleGoBack();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para aulas
        </Button>
      </div>

      <h1 className="text-2xl font-bold">
        Nova Aula
      </h1>
      
      {/* Modal de criação usando o wizard */}
      <AulaStepWizard 
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onSuccess={handleCreateSuccess}
        onClose={handleWizardClose}
      />
    </div>
  );
};

export default FormacaoAulaNova;
