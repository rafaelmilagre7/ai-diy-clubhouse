import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useProgressTracking } from "@/hooks/implementation/useProgressTracking";
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
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  
  const { solution, loading: isLoading, error } = useSolutionData(id);
  const {
    moduleIdx,
    isCompleting,
    handleMarkAsCompleted,
    calculateProgress
  } = useProgressTracking(null, completedTabs.map((_, index) => index), () => {}, 6);

  if (isLoading) {
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

  const handleTabComplete = (tabId: string) => {
    if (!completedTabs.includes(tabId)) {
      setCompletedTabs(prev => [...prev, tabId]);
    }
  };

  const progress = (completedTabs.length / IMPLEMENTATION_TABS.length) * 100;

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
          onComplete={() => handleTabComplete('completion')} 
        />;
      default:
        return <ToolsTab solutionId={id!} onComplete={() => handleTabComplete('tools')} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card className="p-4 bg-gradient-to-r from-background/50 to-background/30 backdrop-blur-sm border-primary/20">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Progresso da Implementação</h3>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <TabsNavigation 
        tabs={IMPLEMENTATION_TABS}
        activeTab={activeTab}
        completedTabs={completedTabs}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <Card className="min-h-[600px] bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-primary/10">
        <div className="p-6">
          {renderTabContent()}
        </div>
      </Card>
    </div>
  );
};

export default ImplementationTabsContainer;