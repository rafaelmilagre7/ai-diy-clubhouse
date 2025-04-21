
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
    <TabsList className="w-full bg-white/70 rounded-lg shadow-md mb-6 p-1 border border-[#0ABAB5]/20 gap-1 overflow-x-auto scrollbar-hide flex justify-between">
      {tabs.map((tab) => (
        <Tooltip key={tab.value}>
          <TooltipTrigger asChild>
            <TabsTrigger
              value={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md transition-all relative flex-1 min-w-0
                ${activeTab === tab.value 
                  ? "bg-[#0ABAB5]/20 text-[#0ABAB5] shadow-sm after:absolute after:-bottom-1 after:left-2 after:right-2 after:h-1 after:bg-[#0ABAB5] after:rounded-full after:animate-enter" 
                  : "text-neutral-700 hover:bg-[#0ABAB5]/10"}
              `}
              tabIndex={0}
            >
              <span className="flex items-center justify-center">
                {tab.icon}
                <span className="hidden sm:inline-block ml-2 text-sm font-medium truncate">{tab.label}</span>
              </span>
            </TabsTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-[#0ABAB5] text-white">
            {tab.label}
          </TooltipContent>
        </Tooltip>
      ))}
    </TabsList>
  </TooltipProvider>
);
