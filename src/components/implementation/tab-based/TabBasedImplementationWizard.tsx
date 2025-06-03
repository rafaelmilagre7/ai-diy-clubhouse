
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useValidations } from "@/hooks/implementation/useValidations";
import { ValidationDialog } from "./validation/ValidationDialog";
import { TabBasedToolsSection } from "./TabBasedToolsSection";
import { TabBasedMaterialsSection } from "./TabBasedMaterialsSection";
import { TabBasedVideosSection } from "./TabBasedVideosSection";
import { TabBasedChecklistSection } from "./TabBasedChecklistSection";
import { TabBasedCommentsSection } from "./TabBasedCommentsSection";
import { CheckCircle, Wrench, FileText, PlayCircle, ListChecks, MessageSquare } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";

interface TabBasedImplementationWizardProps {
  solutionId: string;
}

export const TabBasedImplementationWizard = ({ solutionId }: TabBasedImplementationWizardProps) => {
  const { log } = useLogging();
  const [activeTab, setActiveTab] = useState("tools");
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [validationDialog, setValidationDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    validationResult: any;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    validationResult: null,
    onConfirm: () => {}
  });

  const {
    validateToolsSection,
    validateMaterialsSection,
    validateVideosSection,
    validateChecklistSection
  } = useValidations();

  const handleSectionComplete = (sectionId: string) => {
    log("Seção marcada como concluída", { sectionId });
    setCompletedSections(prev => new Set([...prev, sectionId]));
    
    // Avançar para próxima aba automaticamente
    const tabs = ["tools", "materials", "videos", "checklist", "comments"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const showValidationDialog = (title: string, description: string, validationResult: any, onConfirm: () => void) => {
    setValidationDialog({
      isOpen: true,
      title,
      description,
      validationResult,
      onConfirm
    });
  };

  const handleToolsValidation = (interactionCount: number, timeSpent: number) => {
    const result = validateToolsSection(interactionCount, timeSpent);
    
    if (!result.isValid) {
      showValidationDialog(
        "Validação da Seção Ferramentas",
        "Você precisa explorar mais as ferramentas antes de continuar.",
        result,
        () => handleSectionComplete("tools")
      );
    }
    
    return result;
  };

  const handleMaterialsValidation = (downloadCount: number, timeSpent: number) => {
    const result = validateMaterialsSection(downloadCount, timeSpent);
    
    if (!result.isValid) {
      showValidationDialog(
        "Validação da Seção Materiais",
        "Você precisa baixar e revisar mais materiais antes de continuar.",
        result,
        () => handleSectionComplete("materials")
      );
    }
    
    return result;
  };

  const handleVideosValidation = (watchedCount: number, totalWatchTime: number) => {
    const result = validateVideosSection(watchedCount, totalWatchTime);
    
    if (!result.isValid) {
      showValidationDialog(
        "Validação da Seção Vídeos",
        "Você precisa assistir mais vídeos antes de continuar.",
        result,
        () => handleSectionComplete("videos")
      );
    }
    
    return result;
  };

  const handleChecklistValidation = (checkedItems: number, totalItems: number) => {
    const result = validateChecklistSection(checkedItems, totalItems);
    
    if (!result.isValid) {
      showValidationDialog(
        "Validação da Lista de Verificação",
        "Você precisa completar mais itens da lista antes de continuar.",
        result,
        () => handleSectionComplete("checklist")
      );
    }
    
    return result;
  };

  const getTabIcon = (tabId: string) => {
    const isCompleted = completedSections.has(tabId);
    const iconClass = `w-4 h-4 mr-2 ${isCompleted ? 'text-green-500' : ''}`;
    
    switch (tabId) {
      case "tools": return isCompleted ? <CheckCircle className={iconClass} /> : <Wrench className={iconClass} />;
      case "materials": return isCompleted ? <CheckCircle className={iconClass} /> : <FileText className={iconClass} />;
      case "videos": return isCompleted ? <CheckCircle className={iconClass} /> : <PlayCircle className={iconClass} />;
      case "checklist": return isCompleted ? <CheckCircle className={iconClass} /> : <ListChecks className={iconClass} />;
      case "comments": return <MessageSquare className={iconClass} />;
      default: return null;
    }
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-backgroundLight border border-white/10">
          <TabsTrigger 
            value="tools" 
            className="data-[state=active]:bg-viverblue data-[state=active]:text-white flex items-center"
          >
            {getTabIcon("tools")}
            Ferramentas
          </TabsTrigger>
          <TabsTrigger 
            value="materials" 
            className="data-[state=active]:bg-viverblue data-[state=active]:text-white flex items-center"
          >
            {getTabIcon("materials")}
            Materiais
          </TabsTrigger>
          <TabsTrigger 
            value="videos" 
            className="data-[state=active]:bg-viverblue data-[state=active]:text-white flex items-center"
          >
            {getTabIcon("videos")}
            Vídeos
          </TabsTrigger>
          <TabsTrigger 
            value="checklist" 
            className="data-[state=active]:bg-viverblue data-[state=active]:text-white flex items-center"
          >
            {getTabIcon("checklist")}
            Checklist
          </TabsTrigger>
          <TabsTrigger 
            value="comments" 
            className="data-[state=active]:bg-viverblue data-[state=active]:text-white flex items-center"
          >
            {getTabIcon("comments")}
            Discussão
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tools" className="mt-6">
          <TabBasedToolsSection
            onSectionComplete={() => handleSectionComplete("tools")}
            onValidation={handleToolsValidation}
            isCompleted={completedSections.has("tools")}
          />
        </TabsContent>
        
        <TabsContent value="materials" className="mt-6">
          <TabBasedMaterialsSection
            onSectionComplete={() => handleSectionComplete("materials")}
            onValidation={handleMaterialsValidation}
            isCompleted={completedSections.has("materials")}
          />
        </TabsContent>
        
        <TabsContent value="videos" className="mt-6">
          <TabBasedVideosSection
            onSectionComplete={() => handleSectionComplete("videos")}
            onValidation={handleVideosValidation}
            isCompleted={completedSections.has("videos")}
          />
        </TabsContent>
        
        <TabsContent value="checklist" className="mt-6">
          <TabBasedChecklistSection
            onSectionComplete={() => handleSectionComplete("checklist")}
            onValidation={handleChecklistValidation}
            isCompleted={completedSections.has("checklist")}
          />
        </TabsContent>
        
        <TabsContent value="comments" className="mt-6">
          <TabBasedCommentsSection solutionId={solutionId} />
        </TabsContent>
      </Tabs>

      <ValidationDialog
        isOpen={validationDialog.isOpen}
        onOpenChange={(open) => setValidationDialog(prev => ({ ...prev, isOpen: open }))}
        onConfirm={validationDialog.onConfirm}
        title={validationDialog.title}
        description={validationDialog.description}
        validationMessage={validationDialog.validationResult?.message}
        isValid={validationDialog.validationResult?.isValid || false}
      />
    </>
  );
};
