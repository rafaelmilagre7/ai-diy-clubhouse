
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicInfoTab from "../tabs/BasicInfoTab";
import ToolsTab from "../tabs/ToolsTab";
import ResourcesTab from "../tabs/ResourcesTab";
import VideoTab from "../tabs/VideoTab";
import ChecklistTab from "../tabs/ChecklistTab";
import PublishTab from "../tabs/PublishTab";

interface TabBasedNavigationProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  solution: any;
  currentValues: any;
  onSubmit: (values: any) => Promise<void>;
  saving: boolean;
}

const TabBasedNavigation: React.FC<TabBasedNavigationProps> = ({
  activeTab,
  setActiveTab,
  solution,
  currentValues,
  onSubmit,
  saving
}) => {
  const solutionId = solution?.id || "";

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 md:grid-cols-6">
        <TabsTrigger value="basic">Básico</TabsTrigger>
        <TabsTrigger value="tools">Ferramentas</TabsTrigger>
        <TabsTrigger value="resources">Recursos</TabsTrigger>
        <TabsTrigger value="videos">Vídeos</TabsTrigger>
        <TabsTrigger value="checklist">Checklist</TabsTrigger>
        <TabsTrigger value="publish">Publicar</TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="basic" className="mt-0">
          <BasicInfoTab 
            defaultValues={currentValues} 
            currentValues={currentValues} 
            onSubmit={onSubmit} 
            saving={saving} 
          />
        </TabsContent>
        <TabsContent value="tools" className="mt-0">
          <ToolsTab 
            solution={solution} 
            onSubmit={onSubmit} 
            saving={saving} 
          />
        </TabsContent>
        <TabsContent value="resources" className="mt-0">
          <ResourcesTab 
            solutionId={solutionId} 
            onSave={() => onSubmit(currentValues)} 
            saving={saving} 
          />
        </TabsContent>
        <TabsContent value="videos" className="mt-0">
          <VideoTab 
            solution={solution} 
            currentValues={currentValues} 
            onSubmit={onSubmit} 
            saving={saving} 
          />
        </TabsContent>
        <TabsContent value="checklist" className="mt-0">
          <ChecklistTab 
            solutionId={solutionId} 
            onSave={() => onSubmit(currentValues)} 
            saving={saving} 
          />
        </TabsContent>
        <TabsContent value="publish" className="mt-0">
          <PublishTab
            solution={solution}
            currentValues={currentValues}
            onSubmit={onSubmit}
            saving={saving}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default TabBasedNavigation;
