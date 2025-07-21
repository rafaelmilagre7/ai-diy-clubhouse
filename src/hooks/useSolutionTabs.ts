
import { useState, useMemo } from "react";
import { Solution } from "@/lib/supabase";
import { 
  Eye, 
  Wrench, 
  CheckSquare, 
  Trophy 
} from "lucide-react";

interface SolutionTab {
  id: string;
  title: string;
  icon: React.ReactNode;
  hasContent: boolean;
}

export const useSolutionTabs = (solution: Solution | null) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Generate tabs based on solution data
  const availableTabs = useMemo((): SolutionTab[] => {
    if (!solution) return [];

    const tabs: SolutionTab[] = [];

    // Overview tab - always available
    tabs.push({
      id: "overview",
      title: "Visão Geral",
      icon: <Eye className="w-6 h-6" />,
      hasContent: !!solution.overview
    });

    // Implementation tab - check if has implementation steps
    let hasImplementationSteps = false;
    try {
      if (solution.implementation_steps) {
        const steps = typeof solution.implementation_steps === 'string'
          ? JSON.parse(solution.implementation_steps)
          : solution.implementation_steps;
        hasImplementationSteps = Array.isArray(steps) && steps.length > 0;
      }
    } catch (e) {
      hasImplementationSteps = false;
    }

    tabs.push({
      id: "implementation",
      title: "Implementação",
      icon: <Wrench className="w-6 h-6" />,
      hasContent: hasImplementationSteps
    });

    // Checklist tab - check if has checklist items
    let hasChecklistItems = false;
    try {
      if (solution.checklist_items) {
        const items = typeof solution.checklist_items === 'string'
          ? JSON.parse(solution.checklist_items)
          : solution.checklist_items;
        hasChecklistItems = Array.isArray(items) && items.length > 0;
      }
    } catch (e) {
      hasChecklistItems = false;
    }

    tabs.push({
      id: "checklist",
      title: "Verificação",
      icon: <CheckSquare className="w-6 h-6" />,
      hasContent: hasChecklistItems
    });

    // Completion tab - always available
    tabs.push({
      id: "completion",
      title: "Conclusão",
      icon: <Trophy className="w-6 h-6" />,
      hasContent: true
    });

    return tabs;
  }, [solution]);

  // Auto-select first tab with content
  const firstTabWithContent = useMemo(() => {
    return availableTabs.find(tab => tab.hasContent)?.id || "overview";
  }, [availableTabs]);

  // Update active tab if current one doesn't have content
  const currentTabHasContent = availableTabs.find(tab => tab.id === activeTab)?.hasContent;
  if (!currentTabHasContent && firstTabWithContent !== activeTab) {
    setActiveTab(firstTabWithContent);
  }

  return {
    activeTab,
    setActiveTab,
    availableTabs,
    hasAnyContent: availableTabs.some(tab => tab.hasContent)
  };
};

export default useSolutionTabs;
