
import React from 'react';
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { AulaFormValues } from "@/components/formacao/aulas/types";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

const FormacaoAulaNovaMateriais = () => {
  const form = useFormContext<AulaFormValues>();
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/formacao/aulas/nova/publicacao");
  };

  const handleBack = () => {
    navigate("/formacao/aulas/nova/videos");
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Nova Aula - Materiais</h1>
      
      <div className="space-y-6 bg-card border rounded-xl p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Materiais Complementares</h2>
          <p className="text-muted-foreground">
            Adicione materiais complementares para esta aula, como documentos, 
            planilhas ou slides.
          </p>
          
          <div className="bg-muted/50 p-6 rounded-lg text-center">
            <p>Componente de upload de materiais aqui</p>
          </div>
        </div>
        
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          
          <Button
            type="button"
            onClick={handleNext}
            className="flex items-center"
          >
            Continuar <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormacaoAulaNovaMateriais;
