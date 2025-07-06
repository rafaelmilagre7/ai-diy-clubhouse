
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  CircleHelp, 
  FileSpreadsheet, 
  Film, 
  Folder, 
  ListChecks, 
  Package, 
  Send 
} from "lucide-react";

interface TabNavProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabNav = ({ activeTab, setActiveTab }: TabNavProps) => {
  const tabs = [
    { id: "basic", label: "Informações", icon: <CircleHelp className="h-4 w-4" /> },
    { id: "tools", label: "Ferramentas", icon: <Package className="h-4 w-4" /> },
    { id: "resources", label: "Materiais", icon: <FileSpreadsheet className="h-4 w-4" /> },
    { id: "video", label: "Vídeos", icon: <Film className="h-4 w-4" /> },
    { id: "modules", label: "Módulos", icon: <Folder className="h-4 w-4" /> },
    { id: "checklist", label: "Checklist", icon: <ListChecks className="h-4 w-4" /> },
    { id: "publish", label: "Publicar", icon: <Send className="h-4 w-4" /> },
  ];

  return (
    <TabsList className="grid grid-cols-7 w-full">
      {tabs.map((tab) => (
        <TooltipProvider key={tab.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger
                value={tab.id}
                className={`flex items-center gap-2 ${
                  activeTab === tab.id ? "bg-primary/10 text-primary" : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tab.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </TabsList>
  );
};

export default TabNav;
