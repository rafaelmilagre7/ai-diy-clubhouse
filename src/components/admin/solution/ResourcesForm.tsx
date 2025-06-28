
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useResourcesFormData } from './form/hooks/useResourcesFormData';

// Import FAQ tab component
import ResourceFaqTab from "./form/components/ResourceFaqTab";

interface ResourcesFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ResourcesForm = ({ solutionId, onSave, saving }: ResourcesFormProps) => {
  const {
    resources,
    loading,
    error,
    isSaving,
    addResource,
    updateResource,
    removeResource,
    handleSaveResources,
    loadResources,
    setResources
  } = useResourcesFormData(solutionId);
  
  const saveAndContinue = async () => {
    const success = await handleSaveResources();
    if (success) {
      onSave();
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Carregando recursos...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card className="border border-[#0ABAB5]/20">
        <CardHeader>
          <CardTitle>Perguntas Frequentes (FAQ)</CardTitle>
          <CardDescription>
            Gerencie as perguntas e respostas frequentes relacionadas a esta solução.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Esta seção permite adicionar FAQs relacionadas à solução.
            </p>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={saveAndContinue} 
              disabled={isSaving || saving || !solutionId}
              className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
            >
              {isSaving || saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar FAQ
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourcesForm;
