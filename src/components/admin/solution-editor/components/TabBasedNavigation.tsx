
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
            solution={solution}
            currentValues={currentValues}
            onSubmit={onSubmit}
            saving={saving}
          />
        </TabsContent>
        
        <TabsContent value="tools">
          <ToolsTab
            solution={solution}
            currentValues={currentValues}
            onSubmit={onSubmit}
            saving={saving}
          />
        </TabsContent>
        
        <TabsContent value="materials">
          <ResourcesTab
            solution={solution}
            currentValues={currentValues}
            onSubmit={onSubmit}
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
            solution={solution}
            currentValues={currentValues}
            onSubmit={onSubmit}
            saving={saving}
          />
        </TabsContent>
        
        <TabsContent value="modules">
          <ModulesTab 
            solution={solution} 
          />
        </TabsContent>
        
        <TabsContent value="publish">
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
