
import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FileText, Layers, Link } from "lucide-react";
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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
      <TabsList className="grid grid-cols-3 w-full sm:w-[400px] bg-muted/50">
        <TabsTrigger value="basic" className="flex items-center gap-1.5">
          <FileText className="h-4 w-4" />
          <span>Informações</span>
        </TabsTrigger>
        <TabsTrigger value="modules" className="flex items-center gap-1.5">
          <Layers className="h-4 w-4" />
          <span>Módulos</span>
        </TabsTrigger>
        <TabsTrigger value="resources" className="flex items-center gap-1.5">
          <Link className="h-4 w-4" />
          <span>Recursos</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="space-y-6 mt-6">
        <BasicInfoForm 
          defaultValues={currentValues} 
          onSubmit={onSubmit} 
          saving={saving} 
        />
      </TabsContent>
      
      <TabsContent value="modules" className="space-y-6 mt-6">
        <ModulesForm 
          solutionId={solution?.id || null} 
          onSave={() => onSubmit(currentValues)} 
          saving={saving} 
        />
      </TabsContent>
      
      <TabsContent value="resources" className="space-y-6 mt-6">
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
