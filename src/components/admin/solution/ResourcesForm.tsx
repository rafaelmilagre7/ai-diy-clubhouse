
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, FileText, Download, Link, HelpCircle } from "lucide-react";
import { useResourcesFormData } from './form/hooks/useResourcesFormData';

// Import custom components
import ResourceOverviewTab from "./form/components/ResourceOverviewTab";
import ResourceMaterialsTab from "./form/components/ResourceMaterialsTab";
import ResourceLinksTab from "./form/components/ResourceLinksTab";
import ResourceFaqTab from "./form/components/ResourceFaqTab";
import ModuleSummaryCard from "./form/components/ModuleSummaryCard";

interface ResourcesFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ResourcesForm = ({ solutionId, onSave, saving }: ResourcesFormProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    form,
    modules,
    error,
    isLoading,
    isSaving,
    setError,
    handleSaveResources
  } = useResourcesFormData(solutionId);
  
  const saveAndContinue = async () => {
    const success = await handleSaveResources();
    if (success) {
      onSave();
    }
  };
  
  if (isLoading) {
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
      <Card>
        <CardHeader>
          <CardTitle>Recursos da Solução</CardTitle>
          <CardDescription>
            Gerencie os recursos, materiais de apoio e FAQs relacionados a esta solução.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="overview" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Materiais
              </TabsTrigger>
              <TabsTrigger value="external_links" className="flex-1">
                <Link className="h-4 w-4 mr-2" />
                Links Externos
              </TabsTrigger>
              <TabsTrigger value="faq" className="flex-1">
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <ResourceOverviewTab form={form} />
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <ResourceMaterialsTab form={form} />
            </TabsContent>

            <TabsContent value="external_links" className="space-y-4">
              <ResourceLinksTab form={form} />
            </TabsContent>

            <TabsContent value="faq" className="space-y-4">
              <ResourceFaqTab form={form} />
            </TabsContent>
          </Tabs>
          
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
                  Salvar Recursos
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ModuleSummaryCard modules={modules} />
    </div>
  );
};

export default ResourcesForm;
