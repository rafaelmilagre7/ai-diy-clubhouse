
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Solution } from "@/lib/supabase";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import BasicInfoTab from "../tabs/BasicInfoTab";
import ResourcesTab from "../tabs/ResourcesTab";
import ToolsTab from "../tabs/ToolsTab";
import VideoTab from "../tabs/VideoTab";
import ModulesTab from "../tabs/ModulesTab";
import ChecklistTab from "../tabs/ChecklistTab";
import PublishTab from "../tabs/PublishTab";

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
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-6">
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
            solutionId={solution.id}
            onSave={() => onSubmit(currentValues)}
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
            solutionId={solution.id}
            onSave={() => onSubmit(currentValues)}
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
