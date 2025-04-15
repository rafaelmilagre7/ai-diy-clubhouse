
import React from "react";
import ResourcesForm from "@/components/admin/solution/ResourcesForm";
import ResourcesUploadForm from "@/components/admin/solution/form/ResourcesUploadForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ResourcesTabProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ResourcesTab: React.FC<ResourcesTabProps> = ({
  solutionId,
  onSave,
  saving,
}) => {
  const [activeResourceTab, setActiveResourceTab] = React.useState<string>("advanced");

  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue="advanced" 
        value={activeResourceTab} 
        onValueChange={setActiveResourceTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="advanced">Editor Avançado</TabsTrigger>
          <TabsTrigger value="upload">Upload de Materiais</TabsTrigger>
        </TabsList>
        
        <TabsContent value="advanced" className="mt-0">
          <ResourcesForm 
            solutionId={solutionId} 
            onSave={onSave} 
            saving={saving} 
          />
        </TabsContent>
        
        <TabsContent value="upload" className="mt-0">
          <ResourcesUploadForm 
            solutionId={solutionId} 
            onSave={onSave} 
            saving={saving} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourcesTab;
