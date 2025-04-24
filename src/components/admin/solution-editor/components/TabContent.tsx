
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import BasicInfoTab from "../tabs/BasicInfoTab";
import ToolsTab from "../tabs/ToolsTab";
import ResourcesTab from "../tabs/ResourcesTab";
import ChecklistTab from "../tabs/ChecklistTab";
import PublishTab from "../tabs/PublishTab";
import VideoTab from "../tabs/VideoTab";
import { Solution } from "@/types/supabaseTypes";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";

interface TabContentProps {
  activeTab: string;
  solution: Solution;
  currentValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
  currentStep: number;
}

const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  solution,
  currentValues,
  onSubmit,
  saving,
}) => {
  return (
    <>
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
        <VideoTab
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
      
      <TabsContent value="publish">
        <PublishTab
          solutionId={solution?.id}
          solution={solution}
          onSave={onSubmit}
          saving={saving}
        />
      </TabsContent>
    </>
  );
};

export default TabContent;
