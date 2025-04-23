
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Tool, FileArchive, Video, CheckSquare, Upload, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface SolutionEditorTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  solution: any;
  currentValues: any;
  onSubmit: (values: any) => Promise<void>;
  saving: boolean;
  currentStep: number;
}

const SolutionEditorTabs: React.FC<SolutionEditorTabsProps> = ({
  activeTab,
  setActiveTab,
  solution,
  currentValues,
  onSubmit,
  saving,
  currentStep
}) => {
  const tabs = [
    {
      id: "basic-info",
      label: "Informações Básicas",
      icon: <FileText className="w-4 h-4 mr-2" />,
      step: 0
    },
    {
      id: "tools",
      label: "Ferramentas",
      icon: <Tool className="w-4 h-4 mr-2" />,
      step: 1
    },
    {
      id: "materials",
      label: "Materiais",
      icon: <FileArchive className="w-4 h-4 mr-2" />,
      step: 2
    },
    {
      id: "videos",
      label: "Vídeos",
      icon: <Video className="w-4 h-4 mr-2" />,
      step: 3
    },
    {
      id: "checklist",
      label: "Checklist",
      icon: <CheckSquare className="w-4 h-4 mr-2" />,
      step: 4
    },
    {
      id: "publish",
      label: "Publicar",
      icon: <Send className="w-4 h-4 mr-2" />,
      step: 5
    }
  ];

  return (
    <div className="px-1">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "flex items-center",
                tab.step > currentStep && "opacity-70",
                tab.step === currentStep && "font-medium"
              )}
            >
              {tab.icon}
              <span className="hidden md:inline">{tab.label}</span>
              <span className="inline md:hidden">{tab.label.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default SolutionEditorTabs;
