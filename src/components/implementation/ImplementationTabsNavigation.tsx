
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Monitor, 
  FileText, 
  Wrench, 
  FileArchive, 
  Video, 
  CheckSquare,
  MessageSquare,
  Bot,
  Certificate
} from "lucide-react";

interface ImplementationTabsNavigationProps {
  activeTab: string;
  onChangeTab: (value: string) => void;
  isLastStep?: boolean;
}

const ImplementationTabsNavigation: React.FC<ImplementationTabsNavigationProps> = ({
  activeTab,
  onChangeTab,
  isLastStep = false
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onChangeTab} className="w-full">
      <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full">
        <TabsTrigger value="overview" className="flex items-center justify-center">
          <Monitor className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Visão geral</span>
        </TabsTrigger>
        <TabsTrigger value="tools" className="flex items-center justify-center">
          <Wrench className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Ferramentas</span>
        </TabsTrigger>
        <TabsTrigger value="materials" className="flex items-center justify-center">
          <FileArchive className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Materiais</span>
        </TabsTrigger>
        <TabsTrigger value="videos" className="flex items-center justify-center">
          <Video className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Vídeos</span>
        </TabsTrigger>
        <TabsTrigger value="checklist" className="flex items-center justify-center">
          <CheckSquare className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Checklist</span>
        </TabsTrigger>
        <TabsTrigger value="comments" className="flex items-center justify-center">
          <MessageSquare className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Comentários</span>
        </TabsTrigger>
        <TabsTrigger value="assistant" className="flex items-center justify-center">
          <Bot className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Assistente</span>
        </TabsTrigger>
        
        {isLastStep && (
          <TabsTrigger value="conclusion" className="flex items-center justify-center">
            <Certificate className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Conclusão</span>
          </TabsTrigger>
        )}
      </TabsList>
    </Tabs>
  );
};

export default ImplementationTabsNavigation;
export { ImplementationTabsNavigation };
