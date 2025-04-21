
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
  <TabsList className="w-full bg-white/70 rounded-lg shadow flex mb-6 p-1 border border-[#0ABAB5]/10 gap-1 overflow-x-auto scrollbar-hide">
    {tabs.map((tab) => (
      <TabsTrigger
        key={tab.value}
        value={tab.value}
        onClick={() => setActiveTab(tab.value)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all relative hover:bg-[#0ABAB5]/10
          ${activeTab === tab.value ? "bg-[#0ABAB5]/20 text-[#0ABAB5] scale-105 shadow-sm after:absolute after:-bottom-1 after:left-2 after:right-2 after:h-1 after:bg-gradient-to-r after:from-[#0ABAB5] after:to-[#8ee4e1] after:rounded-full after:animate-enter" : "text-neutral-700" }
        `}
        tabIndex={0}
      >
        {tab.icon}
        <span className="hidden md:inline">{tab.label}</span>
      </TabsTrigger>
    ))}
  </TabsList>
);
