
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  File as FileIcon, 
  FileImage, 
  FileCode,
  FileSpreadsheet,
  Presentation,
} from "lucide-react";

interface ResourceFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilterTab: string;
  setActiveFilterTab: (tab: string) => void;
  openNewResourceDialog: () => void;
}

const ResourceFilterBar: React.FC<ResourceFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  activeFilterTab,
  setActiveFilterTab,
  openNewResourceDialog
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar materiais..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button onClick={openNewResourceDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Material
        </Button>
      </div>
      
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
    </div>
  );
};

export default ResourceFilterBar;
