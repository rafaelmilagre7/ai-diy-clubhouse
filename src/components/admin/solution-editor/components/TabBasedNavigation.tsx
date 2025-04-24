
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicInfoTab from "../tabs/BasicInfoTab";
import ToolsTab from "../tabs/ToolsTab";
import ResourcesTab from "../tabs/ResourcesTab";
import VideoTab from "../tabs/VideoTab";
import ModulesTab from "../tabs/ModulesTab";
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
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 md:grid-cols-7">
        <TabsTrigger value="basic">Básico</TabsTrigger>
        <TabsTrigger value="tools">Ferramentas</TabsTrigger>
        <TabsTrigger value="resources">Recursos</TabsTrigger>
        <TabsTrigger value="videos">Vídeos</TabsTrigger>
        <TabsTrigger value="modules">Módulos</TabsTrigger>
        <TabsTrigger value="checklist">Checklist</TabsTrigger>
        <TabsTrigger value="publish">Publicar</TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="basic" className="mt-0">
          <BasicInfoTab solution={solution} currentValues={currentValues} onSubmit={onSubmit} saving={saving} />
        </TabsContent>
        <TabsContent value="tools" className="mt-0">
          <ToolsTab solution={solution} currentValues={currentValues} onSubmit={onSubmit} saving={saving} />
        </TabsContent>
        <TabsContent value="resources" className="mt-0">
          <ResourcesTab solution={solution} currentValues={currentValues} onSubmit={onSubmit} saving={saving} />
        </TabsContent>
        <TabsContent value="videos" className="mt-0">
          <VideoTab solution={solution} currentValues={currentValues} onSubmit={onSubmit} saving={saving} />
        </TabsContent>
        <TabsContent value="modules" className="mt-0">
          <ModulesTab solution={solution} currentValues={currentValues} onSubmit={onSubmit} saving={saving} />
        </TabsContent>
        <TabsContent value="checklist" className="mt-0">
          <ChecklistTab solution={solution} currentValues={currentValues} onSubmit={onSubmit} saving={saving} />
        </TabsContent>
        <TabsContent value="publish" className="mt-0">
          <PublishTab solution={solution} currentValues={currentValues} onSubmit={onSubmit} saving={saving} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default TabBasedNavigation;
