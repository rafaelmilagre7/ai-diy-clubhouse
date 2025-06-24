
import React, { useState } from "react";
import { Solution } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "./OverviewTab";
import { ResourcesTab } from "./ResourcesTab";
import { ToolsTab } from "./ToolsTab";
import { VideosTab } from "./VideosTab";
import { BookOpen, FileText, Wrench, Video } from "lucide-react";
import { useSolutionStats } from "@/hooks/useSolutionStats";

interface SolutionTabsContentProps {
  solution: Solution;
}

export const SolutionTabsContent = ({ solution }: SolutionTabsContentProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const { stats, loading: statsLoading } = useSolutionStats(solution.id);

  const getTabCounter = (count: number) => {
    if (statsLoading) return "";
    return count > 0 ? ` (${count})` : "";
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">
              Recursos{getTabCounter(stats.resourcesCount)}
            </span>
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">
              Ferramentas{getTabCounter(stats.toolsCount)}
            </span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">
              Vídeos{getTabCounter(stats.videosCount)}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <OverviewTab solution={solution} />
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
