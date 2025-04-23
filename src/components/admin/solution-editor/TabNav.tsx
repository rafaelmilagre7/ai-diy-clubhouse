
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Tool, FileArchive, Video, CheckSquare, Send } from "lucide-react";

interface TabNavProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabNav: React.FC<TabNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: "basic-info",
      label: "Informações",
      icon: <FileText className="w-4 h-4 mr-2" />
    },
    {
      id: "tools",
      label: "Ferramentas",
      icon: <Tool className="w-4 h-4 mr-2" />
    },
    {
      id: "materials",
      label: "Materiais",
      icon: <FileArchive className="w-4 h-4 mr-2" />
    },
    {
      id: "videos",
      label: "Vídeos",
      icon: <Video className="w-4 h-4 mr-2" />
    },
    {
      id: "checklist",
      label: "Checklist",
      icon: <CheckSquare className="w-4 h-4 mr-2" />
    },
    {
      id: "publish",
      label: "Publicar",
      icon: <Send className="w-4 h-4 mr-2" />
    }
  ];

  return (
    <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.id}
          value={tab.id}
          className="flex items-center"
        >
          {tab.icon}
          <span className="hidden md:inline">{tab.label}</span>
          <span className="inline md:hidden">{tab.label.split(" ")[0]}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default TabNav;
