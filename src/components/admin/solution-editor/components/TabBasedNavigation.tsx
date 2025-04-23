
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import TabNav from "../TabNav";
import BasicInfoTab from "../tabs/BasicInfoTab";
import ToolsTab from "../tabs/ToolsTab";
import ResourcesTab from "../tabs/ResourcesTab";
import ChecklistTab from "../tabs/ChecklistTab";
import PublishTab from "../tabs/PublishTab";
import ModulesTab from "../tabs/ModulesTab";
import VideosTab from "../../solution/editor/components/VideosTab";

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
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="mt-6">
        <TabsContent value="basic-info">
          <BasicInfoTab
            defaultValues={currentValues}
            currentValues={currentValues}
            onSubmit={onSubmit}
            saving={saving}
          />
        </TabsContent>
        
        <TabsContent value="tools">
          <ToolsTab
            solution={solution}
            onSubmit={onSubmit}
            saving={saving}
          />
        </TabsContent>
        
        <TabsContent value="materials">
          <ResourcesTab
            solutionId={solution?.id}
            onSave={() => onSubmit(currentValues)}
            saving={saving}
          />
        </TabsContent>
        
        <TabsContent value="videos">
          <VideosTab
            solution={solution}
            currentValues={currentValues}
            onSubmit={onSubmit}
            saving={saving}
          />
        </TabsContent>
        
        <TabsContent value="checklist">
          <ChecklistTab
            solutionId={solution?.id}
            onSave={() => onSubmit(currentValues)}
            saving={saving}
          />
        </TabsContent>
        
        <TabsContent value="modules">
          <ModulesTab 
            solutionId={solution?.id}
            onSave={() => onSubmit(currentValues)} 
            saving={saving}
            currentModuleStep={0}
          />
        </TabsContent>
        
        <TabsContent value="publish">
          <PublishTab
            solutionId={solution?.id}
            solution={solution}
            onSave={onSubmit}
            saving={saving}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default TabBasedNavigation;
