
import React from "react";
import { Solution } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { SolutionOverviewTab } from "./SolutionOverviewTab";

interface SolutionTabsContentProps {
  solution: Solution;
}

export const SolutionTabsContent = ({ solution }: SolutionTabsContentProps) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-1 bg-backgroundLight border border-white/10">
        <TabsTrigger 
          value="overview" 
          className="data-[state=active]:bg-viverblue data-[state=active]:text-white"
        >
          Visão Geral
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <Card className="border-white/10">
          <CardContent className="p-6">
            <SolutionOverviewTab solution={solution} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
