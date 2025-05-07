
import React from 'react';
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { AulaFormValues } from "@/components/formacao/aulas/types";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Clock, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const FormacaoAulaNovaPublicacao = () => {
  const form = useFormContext<AulaFormValues>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/formacao/aulas/nova/materiais");
  };

  const handleSubmit = () => {
    // Simulação de publicação bem-sucedida
    toast.success("Aula publicada com sucesso!");
    navigate("/formacao/aulas");
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Nova Aula - Publicação</h1>
      
      <div className="space-y-6 bg-card border rounded-xl p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Revisar e Publicar</h2>
          <p className="text-muted-foreground">
            Verifique todas as informações antes de publicar a aula.
          </p>
          
          <div className="space-y-4 mt-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Informações Básicas</h3>
              <p><span className="text-muted-foreground">Título:</span> {form.getValues("title")}</p>
              <p><span className="text-muted-foreground">Descrição:</span> {form.getValues("description")}</p>
              
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline">Vídeo adicionado</Badge>
                <Badge variant="outline">Materiais complementares</Badge>
                <Badge variant="success">Pronto para publicação</Badge>
              </div>
            </div>
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
            onClick={handleSubmit}
            className="flex items-center"
          >
            <Save className="mr-2 h-4 w-4" /> Publicar Aula
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormacaoAulaNovaPublicacao;
