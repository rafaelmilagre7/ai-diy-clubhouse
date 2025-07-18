
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
  saving
}) => {
  const [activeResourceTab, setActiveResourceTab] = React.useState<string>("materials");
  
  return (
    <div className="space-y-6 text-neutral-800 dark:text-white">
      <Tabs defaultValue="materials" value={activeResourceTab} onValueChange={setActiveResourceTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 p-1 bg-slate-950">
          <TabsTrigger value="materials" className="data-[state=active]:bg-[#0ABAB5] data-[state=active]:text-white">
            Materiais
          </TabsTrigger>
          <TabsTrigger value="faq" className="data-[state=active]:bg-[#0ABAB5] data-[state=active]:text-white">
            FAQ
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="materials" className="mt-0">
          <ResourcesUploadForm solutionId={solutionId} onSave={onSave} saving={saving} />
        </TabsContent>
        
        <TabsContent value="faq" className="mt-0">
          <ResourcesForm solutionId={solutionId} onSave={onSave} saving={saving} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourcesTab;
