
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tool,
  FileArchive,
  Video,
  CheckSquare,
  MessageSquare,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImplementationTabsNavigationProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export const ImplementationTabsNavigation: React.FC<ImplementationTabsNavigationProps> = ({
  activeTab,
  setActiveTab
}) => {
  const tabs = [
    { id: 'tools', label: 'Ferramentas', icon: <Tool className="w-4 h-4 mr-2" /> },
    { id: 'materials', label: 'Materiais', icon: <FileArchive className="w-4 h-4 mr-2" /> },
    { id: 'videos', label: 'Vídeos', icon: <Video className="w-4 h-4 mr-2" /> },
    { id: 'checklist', label: 'Checklist', icon: <CheckSquare className="w-4 h-4 mr-2" /> },
    { id: 'comments', label: 'Comentários', icon: <MessageSquare className="w-4 h-4 mr-2" /> },
    { id: 'complete', label: 'Finalizar', icon: <CheckCircle className="w-4 h-4 mr-2" /> }
  ];

  return (
    <TabsList className={cn(
      "w-full h-auto p-1 bg-white/80 rounded-lg mb-4",
      "grid grid-cols-3 md:grid-cols-6 gap-1"
    )}>
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.id}
          value={tab.id}
          className={cn(
            "flex items-center justify-center py-2 px-1 data-[state=active]:bg-white data-[state=active]:shadow-sm",
            "text-xs sm:text-sm whitespace-nowrap"
          )}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="inline sm:hidden">{tab.label.substring(0, 4)}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
