
import React from "react";
import { Solution } from "@/lib/supabase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface SolutionTabsContentProps {
  solution: Solution;
}

export const SolutionTabsContent = ({ solution }: SolutionTabsContentProps) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-neutral-800">
        <TabsTrigger value="overview" className="text-neutral-300 data-[state=active]:text-white">
          Visão Geral
        </TabsTrigger>
        <TabsTrigger value="modules" className="text-neutral-300 data-[state=active]:text-white">
          Módulos
        </TabsTrigger>
        <TabsTrigger value="resources" className="text-neutral-300 data-[state=active]:text-white">
          Recursos
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <Card className="bg-[#151823] border border-white/5">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-neutral-100 mb-4">
              Sobre esta solução
            </h3>
            <p className="text-neutral-400">
              {solution.description}
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="modules" className="mt-6">
        <Card className="bg-[#151823] border border-white/5">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-neutral-100 mb-4">
              Módulos da Implementação
            </h3>
            <p className="text-neutral-400">
              Os módulos de implementação estarão disponíveis aqui.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="resources" className="mt-6">
        <Card className="bg-[#151823] border border-white/5">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-neutral-100 mb-4">
              Recursos e Materiais
            </h3>
            <p className="text-neutral-400">
              Recursos e materiais de apoio estarão disponíveis aqui.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
