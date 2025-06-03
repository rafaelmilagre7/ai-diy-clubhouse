
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

interface TabBasedImplementationWizardProps {
  solutionId: string;
}

export const TabBasedImplementationWizard = ({ solutionId }: TabBasedImplementationWizardProps) => {
  const [activeTab, setActiveTab] = useState("tools");
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [showCompletionFeedback, setShowCompletionFeedback] = useState(false);
  const [lastCompletedSection, setLastCompletedSection] = useState("");
  const [tabDirection, setTabDirection] = useState<"left" | "right">("right");

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

  const handleSectionComplete = (sectionId: string) => {
    const newCompleted = new Set(completedSections);
    newCompleted.add(sectionId);
    setCompletedSections(newCompleted);
    saveProgress(newCompleted);
    
    // Show completion feedback
    setLastCompletedSection(tabLabels[sectionId as keyof typeof tabLabels]);
    setShowCompletionFeedback(true);
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
                onSectionComplete={() => handleSectionComplete("tools")}
                isCompleted={completedSections.has("tools")}
              />
            </TabsContent>

            <TabsContent value="materials" className="mt-0">
              <TabBasedMaterialsSection
                onSectionComplete={() => handleSectionComplete("materials")}
                isCompleted={completedSections.has("materials")}
              />
            </TabsContent>

            <TabsContent value="videos" className="mt-0">
              <TabBasedVideosSection
                onSectionComplete={() => handleSectionComplete("videos")}
                isCompleted={completedSections.has("videos")}
              />
            </TabsContent>

            <TabsContent value="checklist" className="mt-0">
              <TabBasedChecklistSection
                onSectionComplete={() => handleSectionComplete("checklist")}
                isCompleted={completedSections.has("checklist")}
              />
            </TabsContent>

            <TabsContent value="comments" className="mt-0">
              <TabBasedCommentsSection />
            </TabsContent>
          </TabTransition>
        </div>
      </Tabs>

      {/* Completion Feedback Modal */}
      <CompletionFeedback
        isVisible={showCompletionFeedback}
        sectionName={lastCompletedSection}
        onContinue={handleContinueAfterCompletion}
      />
    </div>
  );
};
