import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useTabProgress } from "@/hooks/implementation/useTabProgress";
import TabsNavigation from "./TabsNavigation";
import ToolsTab from "./ToolsTab";
import ResourcesTab from "./ResourcesTab";
import VideoTab from "./VideoTab";
import ChecklistTab from "./ChecklistTab";
import CommentsTab from "./CommentsTab";
import CompletionTab from "./CompletionTab";
import { Card } from "@/components/ui/card";

const IMPLEMENTATION_TABS = [
  { id: 'tools', label: 'Ferramentas', icon: '🛠️' },
  { id: 'resources', label: 'Arquivos', icon: '📁' },
  { id: 'video', label: 'Vídeo', icon: '🎥' },
  { id: 'checklist', label: 'Checklist', icon: '✅' },
  { id: 'comments', label: 'Comentários', icon: '💬' },
  { id: 'completion', label: 'Conclusão', icon: '🎯' }
];

const ImplementationTabsContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('tools');
  
  // TODOS OS HOOKS DEVEM ESTAR AQUI NO TOPO - ANTES DE QUALQUER CONDICIONAL
  const { solution, loading: isLoading, error } = useSolutionData(id);
  const {
    completedTabs,
    isLoading: isLoadingProgress,
    markTabComplete,
    isTabCompleted,
    getProgressPercentage
  } = useTabProgress(id || '');

  // Função estável para marcar aba como completa
  const handleTabComplete = React.useCallback(async (tabId: string, progressData?: any) => {
    await markTabComplete(tabId, progressData);
  }, [markTabComplete]);

  const progress = React.useMemo(() => {
    const isCompleted = completedTabs.includes('completion');
    const percentage = completedTabs.length / (IMPLEMENTATION_TABS.length - 1) * 100;
    return isCompleted ? 100 : percentage;
  }, [completedTabs]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tools':
        return <ToolsTab solutionId={id!} onComplete={() => handleTabComplete('tools')} />;
      case 'resources':
        return <ResourcesTab solutionId={id!} onComplete={() => handleTabComplete('resources')} />;
      case 'video':
        return <VideoTab solutionId={id!} onComplete={() => handleTabComplete('video')} />;
      case 'checklist':
        return <ChecklistTab solutionId={id!} onComplete={() => handleTabComplete('checklist')} />;
      case 'comments':
        return <CommentsTab solutionId={id!} onComplete={() => handleTabComplete('comments')} />;
      case 'completion':
        return <CompletionTab 
          solutionId={id!} 
          progress={progress} 
          completedTabs={completedTabs}
          solutionTitle={solution?.title}
          onComplete={() => handleTabComplete('completion')} 
        />;
      default:
        return <ToolsTab solutionId={id!} onComplete={() => handleTabComplete('tools')} />;
    }
  };

  // CONDICIONAIS APENAS APÓS TODOS OS HOOKS
  if (isLoading || isLoadingProgress) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !solution) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Erro ao carregar a solução.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <TabsNavigation 
        tabs={IMPLEMENTATION_TABS}
        activeTab={activeTab}
        completedTabs={completedTabs}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="relative bg-gradient-to-br from-card/40 via-card/20 to-transparent backdrop-blur-md rounded-3xl border-0 shadow-lg min-h-[600px]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/2 to-transparent rounded-3xl"></div>
        <div className="relative p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ImplementationTabsContainer;