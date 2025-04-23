
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Solution } from "@/types/supabaseTypes";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import BasicInfoTab from "@/components/admin/solution-editor/tabs/BasicInfoTab";
import ResourcesTab from "@/components/admin/solution-editor/tabs/ResourcesTab";
import ToolsTab from "@/components/admin/solution-editor/tabs/ToolsTab";
import VideoTab from "@/components/admin/solution-editor/tabs/VideoTab";
import ModulesTab from "@/components/admin/solution-editor/tabs/ModulesTab";
import ChecklistTab from "@/components/admin/solution-editor/tabs/ChecklistTab";
import PublishTab from "@/components/admin/solution-editor/tabs/PublishTab";

interface TabBasedNavigationProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  solution: Solution | null;
  currentValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
}

const TabBasedNavigation: React.FC<TabBasedNavigationProps> = ({
  activeTab,
  setActiveTab,
  solution,
  currentValues,
  onSubmit,
  saving,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-6 w-full">
        <TabsTrigger value="basic">Básico</TabsTrigger>
        <TabsTrigger value="tools" disabled={!solution?.id}>
          Ferramentas
        </TabsTrigger>
        <TabsTrigger value="resources" disabled={!solution?.id}>
          Materiais
        </TabsTrigger>
        <TabsTrigger value="video" disabled={!solution?.id}>
          Vídeos
        </TabsTrigger>
        <TabsTrigger value="modules" disabled={!solution?.id}>
          Módulos
        </TabsTrigger>
        <TabsTrigger value="checklist" disabled={!solution?.id}>
          Checklist
        </TabsTrigger>
        <TabsTrigger value="publish" disabled={!solution?.id}>
          Publicar
        </TabsTrigger>
      </TabsList>

      <TabsContent value="basic">
        <BasicInfoTab 
          defaultValues={currentValues}
          currentValues={currentValues} 
          onSubmit={onSubmit} 
          saving={saving} 
        />
      </TabsContent>

      <TabsContent value="tools">
        {solution?.id ? (
          <ToolsTab
            solution={solution}
            onSubmit={onSubmit}
            saving={saving}
          />
        ) : null}
      </TabsContent>

      <TabsContent value="resources">
        {solution?.id ? (
          <ResourcesTab
            solutionId={solution.id}
            onSave={() => onSubmit(currentValues)}
            saving={saving}
          />
        ) : null}
      </TabsContent>

      <TabsContent value="video">
        {solution?.id ? (
          <VideoTab
            solution={solution}
            onSubmit={onSubmit}
            saving={saving}
          />
        ) : null}
      </TabsContent>

      <TabsContent value="modules">
        {solution?.id ? (
          <ModulesTab
            solutionId={solution.id}
            onSave={() => onSubmit(currentValues)}
            saving={saving}
            currentModuleStep={0}
          />
        ) : null}
      </TabsContent>

      <TabsContent value="checklist">
        {solution?.id ? (
          <ChecklistTab
            solutionId={solution.id}
            onSave={() => onSubmit(currentValues)}
            saving={saving}
          />
        ) : null}
      </TabsContent>

      <TabsContent value="publish">
        {solution?.id ? (
          <PublishTab
            solutionId={solution.id}
            solution={solution}
            onSave={onSubmit}
            saving={saving}
          />
        ) : null}
      </TabsContent>
    </Tabs>
  );
};

export default TabBasedNavigation;
