
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  File as FileIcon, 
  FileImage, 
  FileCode,
  FileSpreadsheet,
  Presentation,
} from "lucide-react";

interface FilterTabsProps {
  activeFilterTab: string;
  setActiveFilterTab: (tab: string) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({
  activeFilterTab,
  setActiveFilterTab
}) => {
  return (
    <Tabs value={activeFilterTab} onValueChange={setActiveFilterTab} className="w-full">
      <TabsList className="flex w-full h-auto flex-wrap gap-2">
        <TabsTrigger value="all" className="flex gap-1 items-center">
          <FileIcon className="h-4 w-4" />
          <span>Todos</span>
        </TabsTrigger>
        <TabsTrigger value="document" className="flex gap-1 items-center">
          <FileText className="h-4 w-4" />
          <span>Documentos</span>
        </TabsTrigger>
        <TabsTrigger value="spreadsheet" className="flex gap-1 items-center">
          <FileSpreadsheet className="h-4 w-4" />
          <span>Planilhas</span>
        </TabsTrigger>
        <TabsTrigger value="presentation" className="flex gap-1 items-center">
          <Presentation className="h-4 w-4" />
          <span>Apresentações</span>
        </TabsTrigger>
        <TabsTrigger value="pdf" className="flex gap-1 items-center">
          <FileText className="h-4 w-4" />
          <span>PDFs</span>
        </TabsTrigger>
        <TabsTrigger value="image" className="flex gap-1 items-center">
          <FileImage className="h-4 w-4" />
          <span>Imagens</span>
        </TabsTrigger>
        <TabsTrigger value="template" className="flex gap-1 items-center">
          <FileCode className="h-4 w-4" />
          <span>Templates</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default FilterTabs;
