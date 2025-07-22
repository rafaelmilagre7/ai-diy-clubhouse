import React, { useState, useCallback } from "react";
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
  
  const { solution, loading: isLoading, error } = useSolutionData(id);
  const {
    completedTabs,
    isLoading: isLoadingProgress,
    markTabComplete,
    isTabCompleted,
    getProgressPercentage
  } = useTabProgress(id || '');

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

  const handleTabComplete = useCallback(async (tabId: string, progressData?: any) => {
    console.log('🎯 Marcando aba como completa:', tabId);
    console.log('📊 Abas já completadas:', completedTabs);
    
    // Marcar aba como completa no banco de dados
    await markTabComplete(tabId, progressData);
    
    console.log('✅ Aba marcada como completa:', tabId);
    
    // Navegar automaticamente para a próxima guia se não for a conclusão
    if (tabId !== 'completion') {
      const currentIndex = IMPLEMENTATION_TABS.findIndex(tab => tab.id === tabId);
      const nextTab = IMPLEMENTATION_TABS[currentIndex + 1];
      
      console.log('🔄 Navegando para próxima aba:', nextTab?.id);
      
      if (nextTab) {
        setActiveTab(nextTab.id);
      }
    }
  }, [markTabComplete, completedTabs]);

  // Crear callbacks memorized para cada aba
  const handleToolsComplete = useCallback(() => handleTabComplete('tools'), [handleTabComplete]);
  const handleResourcesComplete = useCallback(() => handleTabComplete('resources'), [handleTabComplete]);
  const handleVideoComplete = useCallback(() => handleTabComplete('video'), [handleTabComplete]);
  const handleChecklistComplete = useCallback(() => handleTabComplete('checklist'), [handleTabComplete]);
  const handleCommentsComplete = useCallback(() => handleTabComplete('comments'), [handleTabComplete]);
  const handleCompletionComplete = useCallback(() => handleTabComplete('completion'), [handleTabComplete]);

  // Calcular progresso baseado nas abas completadas
  const progress = isTabCompleted('completion') 
    ? 100 
    : getProgressPercentage(IMPLEMENTATION_TABS.length - 1); // Excluir aba de conclusão do cálculo

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tools':
        return <ToolsTab solutionId={id!} onComplete={handleToolsComplete} />;
      case 'resources':
        return <ResourcesTab solutionId={id!} onComplete={handleResourcesComplete} />;
      case 'video':
        return <VideoTab solutionId={id!} onComplete={handleVideoComplete} />;
      case 'checklist':
        return <ChecklistTab solutionId={id!} onComplete={handleChecklistComplete} />;
      case 'comments':
        return <CommentsTab solutionId={id!} onComplete={handleCommentsComplete} />;
      case 'completion':
        return <CompletionTab 
          solutionId={id!} 
          progress={progress} 
          completedTabs={completedTabs}
          onComplete={handleCompletionComplete} 
        />;
      default:
        return <ToolsTab solutionId={id!} onComplete={handleToolsComplete} />;
    }
  };

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