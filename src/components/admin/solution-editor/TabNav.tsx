
import React from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FileText, Layers, Link } from "lucide-react";

interface TabNavProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabNav: React.FC<TabNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <TabsList className="grid grid-cols-3 w-full sm:w-[400px] bg-muted/50 mx-6">
      <TabsTrigger value="basic" className="flex items-center gap-1.5">
        <FileText className="h-4 w-4" />
        <span>Informações</span>
      </TabsTrigger>
      <TabsTrigger value="modules" className="flex items-center gap-1.5">
        <Layers className="h-4 w-4" />
        <span>Módulos</span>
      </TabsTrigger>
      <TabsTrigger value="resources" className="flex items-center gap-1.5">
        <Link className="h-4 w-4" />
        <span>Recursos</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default TabNav;
