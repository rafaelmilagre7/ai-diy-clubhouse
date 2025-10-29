
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Upload, LinkIcon } from "lucide-react";
import { useToastModern } from "@/hooks/useToastModern";
import { useResourcesFormData } from "@/components/admin/solution/form/hooks/useResourcesFormData";
import ResourceMaterialsTab from "@/components/admin/solution/form/components/ResourceMaterialsTab";
import ResourceLinksTab from "@/components/admin/solution/form/components/ResourceLinksTab";

interface ResourcesTabProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ResourcesTab: React.FC<ResourcesTabProps> = ({
  solutionId,
  onSave,
  saving
}) => {
  const { showSuccess, showError } = useToastModern();
  const [activeTab, setActiveTab] = useState("materials");
  const { form, isSaving, handleSaveResources } = useResourcesFormData(solutionId);

  const handleSaveWithToast = async () => {
    try {
      const success = await handleSaveResources();
      if (success) {
        onSave();
        showSuccess("Recursos salvos", "Os materiais e links foram salvos com sucesso.");
      }
    } catch (error: any) {
      console.error("Erro ao salvar recursos:", error);
      showError("Erro ao salvar recursos", error.message || "Ocorreu um erro ao tentar salvar os recursos.");
    }
  };

  return (
    <div className="space-y-6 text-foreground">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Materiais da Solução</h2>
        <p className="text-muted-foreground">
          Gerencie os materiais de apoio e links externos para esta solução.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recursos da Solução</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="materials" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Materiais
              </TabsTrigger>
              <TabsTrigger value="links" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Links Auxiliares
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="materials" className="space-y-4 mt-6">
              <ResourceMaterialsTab form={form} solutionId={solutionId} />
            </TabsContent>
            
            <TabsContent value="links" className="space-y-4 mt-6">
              <ResourceLinksTab form={form} />
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 pt-6 border-t">
            <Button 
              onClick={handleSaveWithToast}
              disabled={isSaving || saving}
              variant="aurora-primary"
              className="w-full"
            >
              {isSaving ? (
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
    </div>
  );
};

export default ResourcesTab;
