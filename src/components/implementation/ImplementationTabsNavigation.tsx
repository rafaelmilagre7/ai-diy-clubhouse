
import React from "react";
import {
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { 
  Package, 
  FileSpreadsheet, 
  Film, 
  CheckSquare, 
  MessageCircle, 
  Award 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ImplementationTabsNavigationProps {
  activeTab: string;
  setActiveTab: (v: string) => void;
}

const tabs = [
  { value: "tools",   label: "Ferramentas", icon: <Package className="h-4 w-4" /> },
  { value: "materials", label: "Materiais", icon: <FileSpreadsheet className="h-4 w-4" /> },
  { value: "videos",  label: "Vídeos", icon: <Film className="h-4 w-4" /> },
  { value: "checklist", label: "Checklist", icon: <CheckSquare className="h-4 w-4" /> },
  { value: "comments", label: "Comentários", icon: <MessageCircle className="h-4 w-4" /> },
  { value: "complete", label: "Concluir", icon: <Award className="h-4 w-4" /> },
];

export const ImplementationTabsNavigation = ({
  activeTab,
  setActiveTab
}: ImplementationTabsNavigationProps) => (
  <TooltipProvider delayDuration={300}>
    <TabsList className="w-full bg-neutral-100/90 dark:bg-neutral-800/50 rounded-lg shadow-sm mb-6 p-1 border border-neutral-200 dark:border-neutral-700/50 gap-1 overflow-x-auto flex justify-between">
      {tabs.map((tab) => (
        <Tooltip key={tab.value}>
          <TooltipTrigger asChild>
            <TabsTrigger
              value={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md transition-all relative flex-1 min-w-0
                ${activeTab === tab.value 
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm after:absolute after:-bottom-1 after:left-2 after:right-2 after:h-0.5 after:bg-neutral-400 dark:after:bg-neutral-400 after:rounded-full after:transition-all" 
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-white/80 dark:hover:bg-neutral-700/50"}
              `}
              tabIndex={0}
            >
              <span className="flex items-center justify-center">
                {tab.icon}
                <span className="hidden sm:inline-block ml-2 text-sm font-medium truncate">{tab.label}</span>
              </span>
            </TabsTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-neutral-800 text-white">
            {tab.label}
          </TooltipContent>
        </Tooltip>
      ))}
    </TabsList>
  </TooltipProvider>
);
