
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Wrench, Play, FileText, CheckSquare, MessageSquare, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ImplementationTabsNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ImplementationTabsNavigation = ({
  activeTab,
  setActiveTab
}: ImplementationTabsNavigationProps) => {
  const tabs = [
    { id: 'tools', label: 'Ferramentas', icon: <Wrench className="h-4 w-4" /> },
    { id: 'materials', label: 'Materiais', icon: <FileText className="h-4 w-4" /> },
    { id: 'videos', label: 'Vídeos', icon: <Play className="h-4 w-4" /> },
    { id: 'checklist', label: 'Checklist', icon: <CheckSquare className="h-4 w-4" /> },
    { id: 'comments', label: 'Comentários', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'complete', label: 'Concluir', icon: <CheckCircle className="h-4 w-4" /> },
  ];

  return (
    <TabsList className="grid grid-cols-3 md:grid-cols-6 p-1 mb-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.id}
          value={tab.id}
          className={cn(
            "flex items-center gap-2 py-2 px-3 transition-all duration-300 relative rounded-lg",
            activeTab === tab.id 
              ? "text-white font-medium bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/30" 
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.icon}
          <span className="hidden md:inline">{tab.label}</span>
          {activeTab === tab.id && (
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              layoutId="activeTabIndicator" 
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
