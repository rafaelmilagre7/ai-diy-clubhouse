
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useImplementationFlow } from "@/hooks/implementation/useImplementationFlow";
import { ImplementationTabsNavigation } from "../ImplementationTabsNavigation";
import { TabBasedToolsSection } from "./TabBasedToolsSection";
import { TabBasedMaterialsSection } from "./TabBasedMaterialsSection";
import { TabBasedVideosSection } from "./TabBasedVideosSection";
import { TabBasedChecklistSection } from "./TabBasedChecklistSection";
import { TabBasedCommentsSection } from "./TabBasedCommentsSection";
import { TabBasedCompleteSection } from "./TabBasedCompleteSection";
import LoadingScreen from "@/components/common/LoadingScreen";
import { AlertCircle } from "lucide-react";

interface OptimizedImplementationWizardProps {
  solutionId: string;
}

export const OptimizedImplementationWizard = ({ solutionId }: OptimizedImplementationWizardProps) => {
  const {
    solution,
    progress,
    materials,
    tools,
    videos,
    loading,
    error,
    activeTab,
    setActiveTab,
    completeImplementation
  } = useImplementationFlow();

  if (loading) {
    return <LoadingScreen message="Carregando implementação..." />;
  }

  if (error || !solution) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Erro ao carregar implementação
          </h3>
          <p className="text-red-700">
            Não foi possível carregar os dados da implementação.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ImplementationTabsNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        <TabsContent value="tools" className="mt-6">
          <TabBasedToolsSection 
            solutionId={solutionId} 
            tools={tools}
          />
        </TabsContent>

        <TabsContent value="materials" className="mt-6">
          <TabBasedMaterialsSection 
            solutionId={solutionId} 
            materials={materials}
          />
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <TabBasedVideosSection 
            solutionId={solutionId} 
            videos={videos}
          />
        </TabsContent>

        <TabsContent value="checklist" className="mt-6">
          <TabBasedChecklistSection 
            solutionId={solutionId}
            solution={solution}
          />
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          <TabBasedCommentsSection solutionId={solutionId} />
        </TabsContent>

        <TabsContent value="complete" className="mt-6">
          <TabBasedCompleteSection 
            solutionId={solutionId}
            solution={solution}
            progress={progress}
            onComplete={completeImplementation}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
