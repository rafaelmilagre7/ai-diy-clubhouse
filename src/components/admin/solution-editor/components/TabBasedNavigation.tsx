
import React from "react";
import { Solution } from "@/lib/supabase";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BasicInfoTab from "../tabs/BasicInfoTab";
import ModulesTab from "../tabs/ModulesTab";
import ResourcesTab from "../tabs/ResourcesTab";
import VideoTab from "../tabs/VideoTab";
import ToolsTab from "../tabs/ToolsTab";

interface TabBasedNavigationProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  solution: Solution | null;
  currentValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
}

/**
 * Componente que gerencia a navegação baseada em abas para o editor de soluções
 */
const TabBasedNavigation = ({
  activeTab,
  setActiveTab,
  solution,
  currentValues,
  onSubmit,
  saving,
}: TabBasedNavigationProps) => {
  // Para garantir que o componente não renderize conteúdo desnecessário
  const renderTabContent = (tabValue: string) => {
    // Se a aba atual não for a que estamos verificando, não renderizamos seu conteúdo
    if (activeTab !== tabValue) return null;
    
    switch (tabValue) {
      case "info":
        return (
          <BasicInfoTab 
            defaultValues={currentValues} 
            onSubmit={onSubmit}
            saving={saving}
          />
        );
      case "modules":
        return (
          <ModulesTab 
            solutionId={solution?.id || null}
            onSave={onSubmit.bind(null, currentValues)}
            saving={saving}
          />
        );
      case "resources":
        return (
          <ResourcesTab
            solutionId={solution?.id || null}
            onSave={onSubmit.bind(null, currentValues)}
            saving={saving}
          />
        );
      case "videos":
        return (
          <VideoTab 
            solutionId={solution?.id || null}
            onSave={onSubmit.bind(null, currentValues)}
            saving={saving}
          />
        );
      case "tools":
        return (
          <ToolsTab 
            solutionId={solution?.id || null}
            onSave={onSubmit.bind(null, currentValues)}
            saving={saving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-5 mb-6 bg-[#F1F0FB] p-1">
        <TabsTrigger 
          value="info"
          className="data-[state=active]:bg-[#0ABAB5] data-[state=active]:text-white"
        >
          Informações
        </TabsTrigger>
        <TabsTrigger 
          value="modules"
          className="data-[state=active]:bg-[#0ABAB5] data-[state=active]:text-white"
          disabled={!solution?.id}
        >
          Módulos
        </TabsTrigger>
        <TabsTrigger 
          value="resources"
          className="data-[state=active]:bg-[#0ABAB5] data-[state=active]:text-white"
          disabled={!solution?.id}
        >
          Materiais
        </TabsTrigger>
        <TabsTrigger 
          value="videos"
          className="data-[state=active]:bg-[#0ABAB5] data-[state=active]:text-white"
          disabled={!solution?.id}
        >
          Vídeos
        </TabsTrigger>
        <TabsTrigger 
          value="tools"
          className="data-[state=active]:bg-[#0ABAB5] data-[state=active]:text-white"
          disabled={!solution?.id}
        >
          Ferramentas
        </TabsTrigger>
      </TabsList>

      {/* Uma TabsContent para cada aba, que só renderiza seu conteúdo quando ativa */}
      <TabsContent value="info" className="mt-0">
        {renderTabContent("info")}
      </TabsContent>
      
      <TabsContent value="modules" className="mt-0">
        {renderTabContent("modules")}
      </TabsContent>
      
      <TabsContent value="resources" className="mt-0">
        {renderTabContent("resources")}
      </TabsContent>
      
      <TabsContent value="videos" className="mt-0">
        {renderTabContent("videos")}
      </TabsContent>
      
      <TabsContent value="tools" className="mt-0">
        {renderTabContent("tools")}
      </TabsContent>
    </Tabs>
  );
};

export default TabBasedNavigation;
