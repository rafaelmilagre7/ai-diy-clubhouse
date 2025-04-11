
import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import BasicInfoForm, { SolutionFormValues } from "@/components/admin/solution/BasicInfoForm";
import ModulesForm from "@/components/admin/solution/ModulesForm";
import ResourcesForm from "@/components/admin/solution/ResourcesForm";
import { Solution } from "@/lib/supabase";

interface SolutionEditorTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  solution: Solution | null;
  currentValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
}

const SolutionEditorTabs = ({
  activeTab,
  setActiveTab,
  solution,
  currentValues,
  onSubmit,
  saving,
}: SolutionEditorTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 w-full sm:w-[400px]">
        <TabsTrigger value="basic">Básico</TabsTrigger>
        <TabsTrigger value="modules">Módulos</TabsTrigger>
        <TabsTrigger value="resources">Recursos</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="space-y-6">
        <BasicInfoForm 
          defaultValues={currentValues} 
          onSubmit={onSubmit} 
          saving={saving} 
        />
      </TabsContent>
      
      <TabsContent value="modules" className="space-y-6">
        <ModulesForm 
          solutionId={solution?.id || null} 
          onSave={() => onSubmit(currentValues)} 
          saving={saving} 
        />
      </TabsContent>
      
      <TabsContent value="resources" className="space-y-6">
        <ResourcesForm 
          solutionId={solution?.id || null} 
          onSave={() => onSubmit(currentValues)} 
          saving={saving} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default SolutionEditorTabs;
