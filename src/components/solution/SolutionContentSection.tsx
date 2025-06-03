
import React from "react";
import { Solution } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { SolutionOverviewTab } from "./tabs/SolutionOverviewTab";
import { SolutionModulesTab } from "./tabs/SolutionModulesTab";
import { SolutionMaterialsTab } from "./tabs/SolutionMaterialsTab";
import { SolutionToolsTab } from "./tabs/SolutionToolsTab";
import { SolutionVideosTab } from "./tabs/SolutionVideosTab";

interface SolutionContentSectionProps {
  solution: Solution;
}

export const SolutionContentSection = ({ solution }: SolutionContentSectionProps) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5 bg-backgroundLight border border-white/10">
        <TabsTrigger 
          value="overview" 
          className="data-[state=active]:bg-viverblue data-[state=active]:text-white"
        >
          Visão Geral
        </TabsTrigger>
        <TabsTrigger 
          value="modules" 
          className="data-[state=active]:bg-viverblue data-[state=active]:text-white"
        >
          Módulos
        </TabsTrigger>
        <TabsTrigger 
          value="materials" 
          className="data-[state=active]:bg-viverblue data-[state=active]:text-white"
        >
          Materiais
        </TabsTrigger>
        <TabsTrigger 
          value="tools" 
          className="data-[state=active]:bg-viverblue data-[state=active]:text-white"
        >
          Ferramentas
        </TabsTrigger>
        <TabsTrigger 
          value="videos" 
          className="data-[state=active]:bg-viverblue data-[state=active]:text-white"
        >
          Vídeos
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <Card className="border-white/10">
          <CardContent className="p-6">
            <SolutionOverviewTab solution={solution} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="modules" className="mt-6">
        <Card className="border-white/10">
          <CardContent className="p-6">
            <SolutionModulesTab solutionId={solution.id} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="materials" className="mt-6">
        <Card className="border-white/10">
          <CardContent className="p-6">
            <SolutionMaterialsTab solutionId={solution.id} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="tools" className="mt-6">
        <Card className="border-white/10">
          <CardContent className="p-6">
            <SolutionToolsTab solutionId={solution.id} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="videos" className="mt-6">
        <Card className="border-white/10">
          <CardContent className="p-6">
            <SolutionVideosTab solutionId={solution.id} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
