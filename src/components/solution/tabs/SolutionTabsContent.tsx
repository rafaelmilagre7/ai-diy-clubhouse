
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SolutionContentSection } from "@/components/solution/SolutionContentSection";
import { Progress } from "@/components/ui/progress";
import { Solution } from "@/lib/supabase";
import { InfoIcon, BookOpen, CheckSquare, Settings, BarChart2 } from "lucide-react";

interface SolutionTabsContentProps {
  solution: Solution;
  progress?: any;
}

export const SolutionTabsContent = ({ solution, progress }: SolutionTabsContentProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const completionPercentage = progress?.completion_percentage || 0;
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full border-b pb-0 rounded-none space-x-8">
        <TabsTrigger 
          value="overview" 
          className="pb-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Visão Geral
        </TabsTrigger>
        <TabsTrigger 
          value="requirements" 
          className="pb-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Requisitos
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="pt-6 pb-4">
        <SolutionContentSection 
          title="Sobre esta Solução" 
          description="Resumo dos principais aspectos desta solução" 
          icon={<InfoIcon className="h-5 w-5 text-primary" />}
        >
          <div className="mt-4 text-muted-foreground">
            <p>{solution.description}</p>
            
            {solution.overview && (
              <div className="mt-4">
                <p>{solution.overview}</p>
              </div>
            )}
            
            {completionPercentage > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progresso</span>
                  <span>{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
            )}
          </div>
        </SolutionContentSection>
        
        <hr className="my-6" />
        
        <SolutionContentSection
          title="Benefícios"
          description="O que você vai conquistar com esta solução"
          icon={<BarChart2 className="h-5 w-5 text-primary" />}
        >
          <div className="mt-4 grid gap-3">
            <div className="bg-slate-50 p-4 rounded-md">
              <h4 className="font-medium text-base mb-1">Aumento de produtividade</h4>
              <p className="text-muted-foreground text-sm">
                Otimize seus processos e economize tempo com automação inteligente
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-md">
              <h4 className="font-medium text-base mb-1">Redução de custos</h4>
              <p className="text-muted-foreground text-sm">
                Diminua despesas operacionais e maximize a eficiência dos recursos
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-md">
              <h4 className="font-medium text-base mb-1">Experiência aprimorada</h4>
              <p className="text-muted-foreground text-sm">
                Ofereça um atendimento personalizado e de alta qualidade
              </p>
            </div>
          </div>
        </SolutionContentSection>
        
        <hr className="my-6" />
        
        <SolutionContentSection
          title="Implementação"
          description="O processo de implementação desta solução"
          icon={<Settings className="h-5 w-5 text-primary" />}
        >
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center font-medium text-sm text-primary">
                1
              </div>
              <div>
                <h4 className="font-medium mb-1">Preparação Inicial</h4>
                <p className="text-muted-foreground text-sm">
                  Configuração do ambiente e definição de metas claras
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center font-medium text-sm text-primary">
                2
              </div>
              <div>
                <h4 className="font-medium mb-1">Implementação Guiada</h4>
                <p className="text-muted-foreground text-sm">
                  Passo a passo com instruções detalhadas e exemplos práticos
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center font-medium text-sm text-primary">
                3
              </div>
              <div>
                <h4 className="font-medium mb-1">Validação e Ajustes</h4>
                <p className="text-muted-foreground text-sm">
                  Testes para garantir que tudo funciona como esperado
                </p>
              </div>
            </div>
          </div>
        </SolutionContentSection>
      </TabsContent>
      
      <TabsContent value="requirements" className="pt-6">
        <SolutionContentSection
          title="Pré-requisitos"
          description="O que você vai precisar para implementar esta solução"
          icon={<CheckSquare className="h-5 w-5 text-primary" />}
        >
          <div className="mt-4 space-y-2">
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm">Acesso administrativo à sua conta do sistema</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm">Conhecimento básico sobre o contexto do negócio</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm">Aproximadamente 2 horas para implementação completa</p>
            </div>
          </div>
        </SolutionContentSection>
        
        <hr className="my-6" />
        
        <SolutionContentSection
          title="Materiais Complementares"
          description="Documentos e recursos de apoio"
          icon={<BookOpen className="h-5 w-5 text-primary" />}
        >
          <div className="mt-4 space-y-3">
            <div className="border rounded-md p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-100 rounded-md text-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <span className="font-medium text-sm">Guia de Implementação.pdf</span>
              </div>
              <button className="text-sm text-blue-600 hover:underline">
                Download
              </button>
            </div>
            
            <div className="border rounded-md p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-green-100 rounded-md text-green-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <rect x="8" y="12" width="8" height="2" />
                    <rect x="8" y="16" width="8" height="2" />
                  </svg>
                </div>
                <span className="font-medium text-sm">Checklist de Validação.xlsx</span>
              </div>
              <button className="text-sm text-blue-600 hover:underline">
                Download
              </button>
            </div>
          </div>
        </SolutionContentSection>
      </TabsContent>
    </Tabs>
  );
};
