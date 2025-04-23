
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Wrench, FileArchive, Video, CheckSquare } from "lucide-react";
import SolutionToolsTab from "./SolutionToolsTab";
import SolutionMaterialsTab from "./SolutionMaterialsTab";
import SolutionVideosTab from "./SolutionVideosTab";
import SolutionChecklistTab from "./SolutionChecklistTab";
import SolutionOverviewTab from "./SolutionOverviewTab";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface SolutionTabsContentProps {
  solution: any;
  progress?: any;
}

export const SolutionTabsContent: React.FC<SolutionTabsContentProps> = ({ solution, progress }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Verificar se o usuário está autenticado antes de mudar de aba
  const handleTabChange = (value: string) => {
    if (!user && value !== "overview") {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para acessar esta funcionalidade.",
        variant: "destructive"
      });
      return;
    }
    setActiveTab(value);
  };

  return (
    <Card className="border shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-5 rounded-none border-b">
            <TabsTrigger value="overview" className="data-[state=active]:bg-muted">
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Visão geral</span>
              <span className="inline md:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-muted">
              <Wrench className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Ferramentas</span>
              <span className="inline md:hidden">Ferramentas</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="data-[state=active]:bg-muted">
              <FileArchive className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Materiais</span>
              <span className="inline md:hidden">Materiais</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-muted">
              <Video className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Vídeos</span>
              <span className="inline md:hidden">Vídeos</span>
            </TabsTrigger>
            <TabsTrigger value="checklist" className="data-[state=active]:bg-muted">
              <CheckSquare className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Checklist</span>
              <span className="inline md:hidden">Checklist</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="py-6 px-6">
            <SolutionOverviewTab solution={solution} />
          </TabsContent>
          <TabsContent value="tools" className="py-6 px-6">
            <SolutionToolsTab solution={solution} />
          </TabsContent>
          <TabsContent value="materials" className="py-6 px-6">
            <SolutionMaterialsTab solution={solution} />
          </TabsContent>
          <TabsContent value="videos" className="py-6 px-6">
            <SolutionVideosTab solution={solution} />
          </TabsContent>
          <TabsContent value="checklist" className="py-6 px-6">
            <SolutionChecklistTab solution={solution} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SolutionTabsContent;
