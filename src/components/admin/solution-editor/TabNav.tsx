
import React from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FileText, Wrench, FileSymlink, Video, ClipboardCheck, Globe } from "lucide-react";

interface TabNavProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabNav: React.FC<TabNavProps> = ({ activeTab, setActiveTab }) => {
  // Função para lidar com o clique em uma aba
  const handleTabClick = (tabValue: string) => {
    console.log("Navegando para a aba:", tabValue);
    setActiveTab(tabValue);
  };

  return (
    <TabsList className="grid grid-cols-6 w-full bg-muted/50 mx-6 rounded-md overflow-x-auto">
      <TabsTrigger 
        value="basic" 
        onClick={() => handleTabClick("basic")} 
        className="flex items-center gap-1.5"
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Informações</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="tools" 
        onClick={() => handleTabClick("tools")} 
        className="flex items-center gap-1.5"
      >
        <Wrench className="h-4 w-4" />
        <span className="hidden sm:inline">Ferramentas</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="resources" 
        onClick={() => handleTabClick("resources")} 
        className="flex items-center gap-1.5"
      >
        <FileSymlink className="h-4 w-4" />
        <span className="hidden sm:inline">Materiais</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="video" 
        onClick={() => handleTabClick("video")} 
        className="flex items-center gap-1.5"
      >
        <Video className="h-4 w-4" />
        <span className="hidden sm:inline">Vídeos</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="checklist" 
        onClick={() => handleTabClick("checklist")} 
        className="flex items-center gap-1.5"
      >
        <ClipboardCheck className="h-4 w-4" />
        <span className="hidden sm:inline">Checklist</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="publish" 
        onClick={() => handleTabClick("publish")} 
        className="flex items-center gap-1.5"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">Publicar</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default TabNav;
