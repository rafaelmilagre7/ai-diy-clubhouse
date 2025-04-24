
import React from "react";
import BasicInfoTab from "@/components/admin/solution-editor/tabs/BasicInfoTab";
import ResourcesTab from "@/components/admin/solution-editor/tabs/ResourcesTab";
import ToolsTab from "@/components/admin/solution-editor/tabs/ToolsTab";
import VideoTab from "@/components/admin/solution-editor/tabs/VideoTab";
import ModulesTab from "@/components/admin/solution-editor/tabs/ModulesTab";
import ChecklistTab from "@/components/admin/solution-editor/tabs/ChecklistTab";
import PublishTab from "@/components/admin/solution-editor/tabs/PublishTab";
import { Solution } from "@/types/supabaseTypes";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";

interface TabContentProps {
  activeTab: string;
  currentStep: number;
  solution: Solution | null;
  currentValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
}

const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  currentStep,
  solution,
  currentValues,
  onSubmit,
  saving
}) => {
  switch (activeTab) {
    case "basic-info":
      return (
        <BasicInfoTab
          defaultValues={currentValues}
          currentValues={currentValues}
          onSubmit={onSubmit}
          saving={saving}
        />
      );
    case "tools":
      return solution ? (
        <ToolsTab solution={solution} onSubmit={onSubmit} saving={saving} />
      ) : null;
    case "materials":
      return solution ? (
        <ResourcesTab
          solutionId={solution.id}
          onSave={() => onSubmit(currentValues)}
          saving={saving}
        />
      ) : null;
    case "videos":
      return solution ? (
        <VideoTab solution={solution} onSubmit={onSubmit} saving={saving} />
      ) : null;
    case "modules":
      return solution ? (
        <ModulesTab
          solutionId={solution.id}
          onSave={() => onSubmit(currentValues)}
          saving={saving}
          currentModuleStep={0}
        />
      ) : null;
    case "checklist":
      return solution ? (
        <ChecklistTab
          solutionId={solution.id}
          onSave={() => onSubmit(currentValues)}
          saving={saving}
        />
      ) : null;
    case "publish":
      return solution ? (
        <PublishTab
          solutionId={solution.id}
          solution={solution}
          onSave={onSubmit}
          saving={saving}
        />
      ) : null;
    default:
      return <div>Tab não encontrada</div>;
  }
};

export default TabContent;
