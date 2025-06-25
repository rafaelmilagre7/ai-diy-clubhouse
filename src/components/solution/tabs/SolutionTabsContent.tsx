
import React, { useState } from "react";
import { Solution } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "./OverviewTab";
import { ModulesTab } from "./ModulesTab";
import { ResourcesTab } from "./ResourcesTab";
import { ToolsTab } from "./ToolsTab";
import { VideosTab } from "./VideosTab";
import { BookOpen, Play, FileText, Wrench, Video } from "lucide-react";

interface SolutionTabsContentProps {
  solution: Solution;
}

export const SolutionTabsContent = ({ solution }: SolutionTabsContentProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Módulos</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Recursos</span>
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Ferramentas</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Vídeos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <OverviewTab solution={solution} />
        </TabsContent>

        <TabsContent value="modules" className="mt-0">
          <ModulesTab solution={solution} />
        </TabsContent>

        <TabsContent value="resources" className="mt-0">
          <ResourcesTab solution={solution} />
        </TabsContent>

        <TabsContent value="tools" className="mt-0">
          <ToolsTab solution={solution} />
        </TabsContent>

        <TabsContent value="videos" className="mt-0">
          <VideosTab solution={solution} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
