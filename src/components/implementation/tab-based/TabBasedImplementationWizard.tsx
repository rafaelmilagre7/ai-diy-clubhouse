
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabBasedToolsSection } from "./TabBasedToolsSection";
import { TabBasedMaterialsSection } from "./TabBasedMaterialsSection";
import { TabBasedVideosSection } from "./TabBasedVideosSection";
import { TabBasedChecklistSection } from "./TabBasedChecklistSection";
import { TabBasedCommentsSection } from "./TabBasedCommentsSection";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";

interface TabBasedImplementationWizardProps {
  solutionId: string;
}

export const TabBasedImplementationWizard = ({ solutionId }: TabBasedImplementationWizardProps) => {
  const [activeTab, setActiveTab] = useState("tools");
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

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

  const handleSectionComplete = (sectionId: string) => {
    const newCompleted = new Set(completedSections);
    newCompleted.add(sectionId);
    setCompletedSections(newCompleted);
    saveProgress(newCompleted);

    // Auto-advance to next tab if not already on last tab
    const tabs = ["tools", "materials", "videos", "checklist"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setTimeout(() => {
        setActiveTab(tabs[currentIndex + 1]);
      }, 1000);
    }
  };

  const tabs = [
    { id: "tools", label: "Ferramentas", icon: "🔧" },
    { id: "materials", label: "Materiais", icon: "📄" },
    { id: "videos", label: "Vídeos", icon: "▶️" },
    { id: "checklist", label: "Checklist", icon: "✅" },
    { id: "comments", label: "Discussão", icon: "💬" }
  ];

  const progressPercentage = (completedSections.size / 4) * 100; // 4 sections excluding comments

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Progresso da Implementação</h2>
          <div className="text-sm font-medium">
            {completedSections.size}/4 seções concluídas
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2 mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Complete cada seção para finalizar a implementação desta solução
        </p>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-backgroundLight border border-white/10">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id}
              value={tab.id} 
              className="data-[state=active]:bg-viverblue data-[state=active]:text-white relative"
            >
              <div className="flex items-center gap-2">
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {completedSections.has(tab.id) && tab.id !== "comments" && (
                  <CheckCircle className="w-4 h-4 text-green-500 ml-1" />
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="tools" className="mt-6">
          <TabBasedToolsSection
            onSectionComplete={() => handleSectionComplete("tools")}
            isCompleted={completedSections.has("tools")}
          />
        </TabsContent>

        <TabsContent value="materials" className="mt-6">
          <TabBasedMaterialsSection
            onSectionComplete={() => handleSectionComplete("materials")}
            isCompleted={completedSections.has("materials")}
          />
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <TabBasedVideosSection
            onSectionComplete={() => handleSectionComplete("videos")}
            isCompleted={completedSections.has("videos")}
          />
        </TabsContent>

        <TabsContent value="checklist" className="mt-6">
          <TabBasedChecklistSection
            onSectionComplete={() => handleSectionComplete("checklist")}
            isCompleted={completedSections.has("checklist")}
          />
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          <TabBasedCommentsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};
