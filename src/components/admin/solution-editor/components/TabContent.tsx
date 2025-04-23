
import React from "react";
import BasicInfoTab from "./BasicInfoTab";
import ToolsTab from "./ToolsTab";
import MaterialsTab from "./MaterialsTab";
import VideosTab from "./VideosTab";
import ChecklistTab from "./ChecklistTab";
import PublishTab from "./PublishTab";

interface TabContentProps {
  activeTab: string;
  currentStep: number;
  solution: any;
  currentValues: any;
  onSubmit: (values: any) => Promise<void>;
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
  // Renderiza o conteúdo apropriado baseado na aba ativa
  switch (activeTab) {
    case "basic-info":
      return (
        <BasicInfoTab
          solution={solution}
          currentValues={currentValues}
          onSubmit={onSubmit}
          saving={saving}
        />
      );
    case "tools":
      return (
        <ToolsTab
          solution={solution}
          currentValues={currentValues}
          onSubmit={onSubmit}
          saving={saving}
        />
      );
    case "materials":
      return (
        <MaterialsTab
          solution={solution}
          currentValues={currentValues}
          onSubmit={onSubmit}
          saving={saving}
        />
      );
    case "videos":
      return (
        <VideosTab
          solution={solution}
          currentValues={currentValues}
          onSubmit={onSubmit}
          saving={saving}
        />
      );
    case "checklist":
      return (
        <ChecklistTab
          solution={solution}
          currentValues={currentValues}
          onSubmit={onSubmit}
          saving={saving}
        />
      );
    case "publish":
      return (
        <PublishTab
          solution={solution}
          currentValues={currentValues}
          onSubmit={onSubmit}
          saving={saving}
        />
      );
    default:
      return <div>Conteúdo não encontrado</div>;
  }
};

export default TabContent;
