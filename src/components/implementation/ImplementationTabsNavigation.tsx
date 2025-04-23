
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Wrench, 
  FileArchive, 
  Video, 
  CheckSquare, 
  MessageSquare, 
  Bot, 
  Trophy 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImplementationTabsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  progress: any;
  className?: string;
}

const ImplementationTabsNavigation = ({
  activeTab,
  onTabChange,
  progress,
  className
}: ImplementationTabsNavigationProps) => {
  const isCompleted = progress?.is_completed || false;

  const tabs = [
    {
      id: "overview",
      label: "Visão geral",
      shortLabel: "Visão",
      icon: <FileText className="w-4 h-4 mr-2" />,
      disabled: false
    },
    {
      id: "tools",
      label: "Ferramentas",
      shortLabel: "Ferramentas",
      icon: <Wrench className="w-4 h-4 mr-2" />,
      disabled: false
    },
    {
      id: "materials",
      label: "Materiais",
      shortLabel: "Materiais",
      icon: <FileArchive className="w-4 h-4 mr-2" />,
      disabled: false
    },
    {
      id: "videos",
      label: "Vídeos",
      shortLabel: "Vídeos",
      icon: <Video className="w-4 h-4 mr-2" />,
      disabled: false
    },
    {
      id: "checklist",
      label: "Checklist",
      shortLabel: "Checklist",
      icon: <CheckSquare className="w-4 h-4 mr-2" />,
      disabled: false
    },
    {
      id: "comments",
      label: "Comentários",
      shortLabel: "Comentários",
      icon: <MessageSquare className="w-4 h-4 mr-2" />,
      disabled: false
    },
    {
      id: "ai-assistant",
      label: "Assistente IA",
      shortLabel: "IA",
      icon: <Bot className="w-4 h-4 mr-2" />,
      disabled: false
    },
    {
      id: "conclusion",
      label: "Conclusão",
      shortLabel: "Final",
      icon: <Trophy className="w-4 h-4 mr-2" />,
      disabled: false
    }
  ];

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={onTabChange}
      className={cn("w-full", className)}
    >
      <TabsList className="w-full overflow-x-auto flex flex-nowrap p-1 h-auto">
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className="flex-shrink-0 py-1.5 px-2.5 h-auto"
          >
            {tab.icon}
            <span className="hidden md:inline-block">{tab.label}</span>
            <span className="inline-block md:hidden">{tab.shortLabel}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default ImplementationTabsNavigation;
