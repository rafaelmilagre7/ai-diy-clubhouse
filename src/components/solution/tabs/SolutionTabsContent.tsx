
import React from "react";
import { Solution } from "@/lib/supabase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SolutionContentSection } from "../SolutionContentSection";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, FileText, Server, Wrench } from "lucide-react";

interface SolutionTabsContentProps {
  solution: Solution;
  progress?: any;
}

export const SolutionTabsContent = ({ solution, progress }: SolutionTabsContentProps) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="implementation">Implementação</TabsTrigger>
        <TabsTrigger value="resources">Recursos</TabsTrigger>
        <TabsTrigger value="prerequisites">Requisitos</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Card>
          <CardContent className="pt-6">
            <SolutionContentSection
              title="Sobre esta Solução"
              description={solution.description}
              icon={<FileText className="h-5 w-5 text-muted-foreground" />}
            >
              {solution.overview && (
                <div className="mt-4 text-gray-700">
                  <p>{solution.overview}</p>
                </div>
              )}
            </SolutionContentSection>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="implementation">
        <Card>
          <CardContent className="pt-6">
            <SolutionContentSection
              title="Como Implementar"
              description="Guia passo a passo para implementar esta solução em seu negócio"
              icon={<Server className="h-5 w-5 text-muted-foreground" />}
            >
              {solution.implementation_steps && Array.isArray(solution.implementation_steps) && solution.implementation_steps.length > 0 ? (
                <div className="mt-4">
                  <ol className="list-decimal list-inside space-y-3">
                    {solution.implementation_steps.map((step: any, index: number) => (
                      <li key={index} className="pl-2">
                        <div className="font-medium inline">{step.title || `Passo ${index + 1}`}</div>
                        {step.description && <p className="text-gray-600 mt-1">{step.description}</p>}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <div className="mt-4 text-gray-600">
                  <p>
                    Para implementar esta solução, clique no botão "Começar Implementação" 
                    e siga o guia interativo passo a passo.
                  </p>
                </div>
              )}
            </SolutionContentSection>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="resources">
        <Card>
          <CardContent className="pt-6">
            <SolutionContentSection
              title="Recursos Necessários"
              description="Ferramentas e recursos para implementação bem-sucedida"
              icon={<Wrench className="h-5 w-5 text-muted-foreground" />}
            >
              <div className="mt-4">
                {solution.modules && solution.modules.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Esta solução inclui {solution.modules.length} módulos para guiar sua implementação:
                    </p>
                    
                    <ul className="space-y-2">
                      {solution.modules.map((module, index) => (
                        <li key={module.id} className="flex items-start gap-2">
                          <div className="mt-0.5">
                            {progress?.completed_modules?.includes(index) ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <div className="h-5 w-5 border rounded-full flex items-center justify-center text-xs">
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{module.title}</p>
                            {module.estimated_time_minutes > 0 && (
                              <p className="text-xs text-gray-500">
                                Tempo estimado: {module.estimated_time_minutes} minutos
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Recursos específicos serão disponibilizados durante o processo de implementação.
                  </p>
                )}
              </div>
            </SolutionContentSection>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="prerequisites">
        <Card>
          <CardContent className="pt-6">
            <SolutionContentSection
              title="Requisitos para Implementação"
              description="Pré-requisitos e conhecimentos necessários"
              icon={<CheckCircle className="h-5 w-5 text-muted-foreground" />}
            >
              <div className="mt-4">
                {solution.prerequisites && Array.isArray(solution.prerequisites) && solution.prerequisites.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2">
                    {solution.prerequisites.map((prerequisite: any, index: number) => (
                      <li key={index} className="text-gray-700">
                        {prerequisite.text || prerequisite}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">
                    Não há pré-requisitos específicos para esta solução. Você pode implementá-la 
                    com os conhecimentos básicos que já possui.
                  </p>
                )}
                
                {solution.completion_criteria && Array.isArray(solution.completion_criteria) && solution.completion_criteria.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Critérios de Conclusão</h4>
                    <ul className="list-disc list-inside space-y-2">
                      {solution.completion_criteria.map((criteria: any, index: number) => (
                        <li key={index} className="text-gray-700">
                          {criteria.text || criteria}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </SolutionContentSection>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
