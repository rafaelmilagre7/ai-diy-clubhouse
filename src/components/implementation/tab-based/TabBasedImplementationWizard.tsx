
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TabBasedToolsSection } from "./TabBasedToolsSection";
import { TabBasedMaterialsSection } from "./TabBasedMaterialsSection";
import { TabBasedVideosSection } from "./TabBasedVideosSection";
import { TabBasedChecklistSection } from "./TabBasedChecklistSection";
import { TabBasedCommentsSection } from "./TabBasedCommentsSection";
import { EnhancedProgressBar } from "./progress/EnhancedProgressBar";
import { AnimatedTabsList } from "./navigation/AnimatedTabsList";
import { TabTransition } from "./transitions/TabTransition";
import { CompletionFeedback } from "./feedback/CompletionFeedback";
import { ValidationDialog } from "./validation/ValidationDialog";
import { useValidations } from "@/hooks/implementation/useValidations";

interface TabBasedImplementationWizardProps {
  solutionId: string;
}

export const TabBasedImplementationWizard = ({ solutionId }: TabBasedImplementationWizardProps) => {
  const [activeTab, setActiveTab] = useState("tools");
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [showCompletionFeedback, setShowCompletionFeedback] = useState(false);
  const [lastCompletedSection, setLastCompletedSection] = useState("");
  const [tabDirection, setTabDirection] = useState<"left" | "right">("right");
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [pendingCompletion, setPendingCompletion] = useState<{
    sectionId: string;
    sectionName: string;
  } | null>(null);

  const { 
    validations, 
    validateToolsSection, 
    validateMaterialsSection, 
    validateVideosSection, 
    validateChecklistSection,
    getSectionValidation,
    isAllValid 
  } = useValidations();

  const tabs = [
    { id: "tools", label: "Ferramentas", icon: "🔧" },
    { id: "materials", label: "Materiais", icon: "📄" },
    { id: "videos", label: "Vídeos", icon: "▶️" },
    { id: "checklist", label: "Checklist", icon: "✅" },
    { id: "comments", label: "Discussão", icon: "💬" }
  ];

  const tabLabels = {
    tools: "Ferramentas",
    materials: "Materiais",
    videos: "Vídeos",
    checklist: "Checklist",
    comments: "Discussão"
  };

  // Load completed sections from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`implementation-progress-${solutionId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompletedSections(new Set(parsed.completedSections || []));
      } catch (error) {
        console.error('Error loading implementation progress:', error);
      }
    }
  }, [solutionId]);

  // Save progress to localStorage
  const saveProgress = (newCompletedSections: Set<string>) => {
    const progressData = {
      completedSections: Array.from(newCompletedSections),
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(`implementation-progress-${solutionId}`, JSON.stringify(progressData));
  };

  // Handle tab change with direction detection
  const handleTabChange = (newTab: string) => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const newIndex = tabs.findIndex(tab => tab.id === newTab);
    setTabDirection(newIndex > currentIndex ? "right" : "left");
    setActiveTab(newTab);
  };

  const handleSectionComplete = (sectionId: string, validationData?: any) => {
    const sectionName = tabLabels[sectionId as keyof typeof tabLabels];
    
    // Validar seção antes de completar
    let validation;
    switch (sectionId) {
      case 'tools':
        validation = validateToolsSection(
          validationData?.interactionCount || 0, 
          validationData?.timeSpent || 0
        );
        break;
      case 'materials':
        validation = validateMaterialsSection(
          validationData?.downloadCount || 0, 
          validationData?.timeSpent || 0
        );
        break;
      case 'videos':
        validation = validateVideosSection(
          validationData?.watchedCount || 0, 
          validationData?.totalWatchTime || 0
        );
        break;
      case 'checklist':
        validation = validateChecklistSection(
          validationData?.checkedItems || 0, 
          validationData?.totalItems || 0
        );
        break;
      default:
        validation = { isValid: true };
    }

    if (!validation.isValid) {
      setPendingCompletion({ sectionId, sectionName });
      setShowValidationDialog(true);
      return;
    }

    // Completar seção
    completeSection(sectionId, sectionName);
  };

  const completeSection = (sectionId: string, sectionName: string) => {
    const newCompleted = new Set(completedSections);
    newCompleted.add(sectionId);
    setCompletedSections(newCompleted);
    saveProgress(newCompleted);
    
    // Show completion feedback
    setLastCompletedSection(sectionName);
    setShowCompletionFeedback(true);
  };

  const handleValidationConfirm = () => {
    if (pendingCompletion) {
      completeSection(pendingCompletion.sectionId, pendingCompletion.sectionName);
      setPendingCompletion(null);
    }
  };

  const handleContinueAfterCompletion = () => {
    setShowCompletionFeedback(false);
    
    // Auto-advance to next tab if not already on last tab
    const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentTabIndex < tabs.length - 1) {
      const nextTab = tabs[currentTabIndex + 1];
      setTimeout(() => {
        handleTabChange(nextTab.id);
      }, 300);
    }
  };

  const progressPercentage = (completedSections.size / 4) * 100; // 4 sections excluding comments

  return (
    <div className="space-y-6">
      {/* Enhanced Progress Header */}
      <EnhancedProgressBar
        completedSections={completedSections.size}
        totalSections={4}
        currentSection={tabLabels[activeTab as keyof typeof tabLabels]}
        estimatedTimeRemaining={completedSections.size === 4 ? "Concluído!" : "5-10 min"}
      />

      {/* Tab Navigation with Animations */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <AnimatedTabsList
          tabs={tabs}
          completedSections={completedSections}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <div className="mt-6">
          <TabTransition activeTab={activeTab} direction={tabDirection}>
            <TabsContent value="tools" className="mt-0">
              <TabBasedToolsSection
                onSectionComplete={(validationData) => handleSectionComplete("tools", validationData)}
                isCompleted={completedSections.has("tools")}
                validation={getSectionValidation("tools")}
              />
            </TabsContent>

            <TabsContent value="materials" className="mt-0">
              <TabBasedMaterialsSection
                onSectionComplete={(validationData) => handleSectionComplete("materials", validationData)}
                isCompleted={completedSections.has("materials")}
                validation={getSectionValidation("materials")}
              />
            </TabsContent>

            <TabsContent value="videos" className="mt-0">
              <TabBasedVideosSection
                onSectionComplete={(validationData) => handleSectionComplete("videos", validationData)}
                isCompleted={completedSections.has("videos")}
                validation={getSectionValidation("videos")}
              />
            </TabsContent>

            <TabsContent value="checklist" className="mt-0">
              <TabBasedChecklistSection
                onSectionComplete={(validationData) => handleSectionComplete("checklist", validationData)}
                isCompleted={completedSections.has("checklist")}
                validation={getSectionValidation("checklist")}
              />
            </TabsContent>

            <TabsContent value="comments" className="mt-0">
              <TabBasedCommentsSection />
            </TabsContent>
          </TabTransition>
        </div>
      </Tabs>

      {/* Validation Dialog */}
      <ValidationDialog
        isOpen={showValidationDialog}
        onOpenChange={setShowValidationDialog}
        onConfirm={handleValidationConfirm}
        title="Confirmação de Conclusão"
        description={
          pendingCompletion 
            ? `Você está prestes a marcar a seção "${pendingCompletion.sectionName}" como concluída.`
            : ""
        }
        validationMessage={
          pendingCompletion 
            ? getSectionValidation(pendingCompletion.sectionId)?.message
            : undefined
        }
        isValid={
          pendingCompletion 
            ? getSectionValidation(pendingCompletion.sectionId)?.isValid || false
            : false
        }
        confirmText={
          pendingCompletion && !getSectionValidation(pendingCompletion.sectionId)?.isValid
            ? "Concluir Mesmo Assim"
            : "Confirmar Conclusão"
        }
      />

      {/* Completion Feedback Modal */}
      <CompletionFeedback
        isVisible={showCompletionFeedback}
        sectionName={lastCompletedSection}
        onContinue={handleContinueAfterCompletion}
      />
    </div>
  );
};
