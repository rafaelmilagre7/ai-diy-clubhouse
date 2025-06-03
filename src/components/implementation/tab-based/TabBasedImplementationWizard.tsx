
import React, { useState, useEffect, useCallback } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useLogging } from "@/hooks/useLogging";
import { TabBasedToolsSection } from "./TabBasedToolsSection";
import { TabBasedMaterialsSection } from "./TabBasedMaterialsSection";
import { TabBasedVideosSection } from "./TabBasedVideosSection";
import { TabBasedChecklistSection } from "./TabBasedChecklistSection";
import { TabBasedCommentsSection } from "./TabBasedCommentsSection";
import { TabTransition } from "./transitions/TabTransition";
import { CompletionFeedback } from "./feedback/CompletionFeedback";
import { EnhancedProgressBar } from "./progress/EnhancedProgressBar";
import { AnimatedTabsList } from "./navigation/AnimatedTabsList";
import { ValidationDialog } from "./validation/ValidationDialog";
import { useValidations } from "@/hooks/implementation/useValidations";

interface TabBasedImplementationWizardProps {
  solutionId: string;
}

const TABS = [
  { id: "tools", label: "Ferramentas", icon: "🛠️" },
  { id: "materials", label: "Materiais", icon: "📚" },
  { id: "videos", label: "Vídeos", icon: "📹" },
  { id: "checklist", label: "Checklist", icon: "✅" },
  { id: "comments", label: "Discussão", icon: "💬" }
];

export const TabBasedImplementationWizard = ({ solutionId }: TabBasedImplementationWizardProps) => {
  const [activeTab, setActiveTab] = useState("tools");
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [showCompletionFeedback, setShowCompletionFeedback] = useState(false);
  const [completedSectionName, setCompletedSectionName] = useState("");
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [pendingCompletion, setPendingCompletion] = useState<string | null>(null);
  
  const { log } = useLogging();
  const { validations, validateToolsSection, validateMaterialsSection, validateVideosSection, validateChecklistSection, getSectionValidation } = useValidations();

  // Carregar progresso do localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`implementation-progress-${solutionId}`);
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setCompletedSections(new Set(progress.completedSections || []));
        setActiveTab(progress.activeTab || "tools");
      } catch (error) {
        log("Erro ao carregar progresso salvo", { error });
      }
    }
  }, [solutionId, log]);

  // Salvar progresso no localStorage
  const saveProgress = useCallback((completed: Set<string>, active: string) => {
    const progress = {
      completedSections: Array.from(completed),
      activeTab: active,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(`implementation-progress-${solutionId}`, JSON.stringify(progress));
    log("Progresso salvo", progress);
  }, [solutionId, log]);

  const getTabDirection = (fromIndex: number, toIndex: number) => {
    return toIndex > fromIndex ? "right" : "left";
  };

  const handleTabChange = (tabId: string) => {
    const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
    const newIndex = TABS.findIndex(tab => tab.id === tabId);
    
    setDirection(getTabDirection(currentIndex, newIndex));
    setActiveTab(tabId);
    saveProgress(completedSections, tabId);
    
    log("Mudança de aba", { from: activeTab, to: tabId, direction: getTabDirection(currentIndex, newIndex) });
  };

  const handleSectionComplete = (sectionId: string, sectionName: string) => {
    const validation = getSectionValidation(sectionId);
    
    if (!validation?.isValid) {
      setPendingCompletion(sectionId);
      setShowValidationDialog(true);
      return;
    }

    completeSection(sectionId, sectionName);
  };

  const completeSection = (sectionId: string, sectionName: string) => {
    const newCompleted = new Set(completedSections);
    newCompleted.add(sectionId);
    setCompletedSections(newCompleted);
    saveProgress(newCompleted, activeTab);
    
    setCompletedSectionName(sectionName);
    setShowCompletionFeedback(true);
    
    log("Seção completada", { sectionId, sectionName });
  };

  const handleCompletionContinue = () => {
    setShowCompletionFeedback(false);
    
    // Auto-avançar para próxima aba se não for a última
    const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
    if (currentIndex < TABS.length - 1) {
      const nextTab = TABS[currentIndex + 1];
      setTimeout(() => {
        handleTabChange(nextTab.id);
      }, 500);
    }
  };

  const handleValidationConfirm = () => {
    if (pendingCompletion) {
      const tabName = TABS.find(tab => tab.id === pendingCompletion)?.label || pendingCompletion;
      completeSection(pendingCompletion, tabName);
      setPendingCompletion(null);
    }
    setShowValidationDialog(false);
  };

  const currentTabName = TABS.find(tab => tab.id === activeTab)?.label || activeTab;
  const completedCount = completedSections.size;
  const totalSections = TABS.length - 1; // Excluir a aba de comentários do total

  const renderTabContent = () => {
    const commonProps = {
      isCompleted: completedSections.has(activeTab)
    };

    const handleToolsComplete = () => handleSectionComplete("tools", "Ferramentas");
    const handleMaterialsComplete = () => handleSectionComplete("materials", "Materiais");
    const handleVideosComplete = () => handleSectionComplete("videos", "Vídeos");
    const handleChecklistComplete = () => handleSectionComplete("checklist", "Checklist");

    switch (activeTab) {
      case "tools":
        return (
          <TabBasedToolsSection 
            {...commonProps}
            onSectionComplete={handleToolsComplete}
            onValidation={(interactionCount: number, timeSpent: number) => 
              validateToolsSection(interactionCount, timeSpent)
            }
          />
        );
      case "materials":
        return (
          <TabBasedMaterialsSection 
            {...commonProps}
            onSectionComplete={handleMaterialsComplete}
            onValidation={(downloadCount: number, timeSpent: number) => 
              validateMaterialsSection(downloadCount, timeSpent)
            }
          />
        );
      case "videos":
        return (
          <TabBasedVideosSection 
            {...commonProps}
            onSectionComplete={handleVideosComplete}
            onValidation={(watchedCount: number, totalWatchTime: number) => 
              validateVideosSection(watchedCount, totalWatchTime)
            }
          />
        );
      case "checklist":
        return (
          <TabBasedChecklistSection 
            {...commonProps}
            onSectionComplete={handleChecklistComplete}
            onValidation={(checkedItems: number, totalItems: number) => 
              validateChecklistSection(checkedItems, totalItems)
            }
          />
        );
      case "comments":
        return <TabBasedCommentsSection solutionId={solutionId} />;
      default:
        return <div>Seção não encontrada</div>;
    }
  };

  const validation = pendingCompletion ? getSectionValidation(pendingCompletion) : null;

  return (
    <div className="space-y-6">
      <EnhancedProgressBar
        completedSections={completedCount}
        totalSections={totalSections}
        currentSection={currentTabName}
      />

      <Card className="border-white/10 bg-backgroundLight">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <AnimatedTabsList
            tabs={TABS}
            completedSections={completedSections}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          <div className="p-6">
            <TabTransition activeTab={activeTab} direction={direction}>
              {renderTabContent()}
            </TabTransition>
          </div>
        </Tabs>
      </Card>

      <CompletionFeedback
        isVisible={showCompletionFeedback}
        sectionName={completedSectionName}
        onContinue={handleCompletionContinue}
      />

      <ValidationDialog
        isOpen={showValidationDialog}
        onOpenChange={setShowValidationDialog}
        onConfirm={handleValidationConfirm}
        title="Completar Seção"
        description="Você tem certeza que deseja marcar esta seção como concluída?"
        validationMessage={validation?.message}
        isValid={validation?.isValid || false}
        confirmText={validation?.isValid ? "Continuar" : "Completar Mesmo Assim"}
      />
    </div>
  );
};
