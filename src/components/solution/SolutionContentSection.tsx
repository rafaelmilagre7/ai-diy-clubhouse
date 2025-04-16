
import { CheckCircle, ArrowRight, BarChart, Clock, User, Shield } from "lucide-react";
import { Solution } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SolutionContentSectionProps {
  solution: Solution;
}

export const SolutionContentSection = ({ solution }: SolutionContentSectionProps) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold flex items-center">
          <BarChart className="h-6 w-6 mr-2 text-viverblue" />
          Visão Geral
        </h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">{solution.description}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="flex flex-col p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center text-muted-foreground mb-1">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm">Tempo estimado</span>
            </div>
            <span className="font-medium">1-2 horas</span>
          </div>
          
          <div className="flex flex-col p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center text-muted-foreground mb-1">
              <User className="h-4 w-4 mr-1" />
              <span className="text-sm">Implementado por</span>
            </div>
            <span className="font-medium">125+ membros</span>
          </div>
          
          <div className="flex flex-col p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center text-muted-foreground mb-1">
              <Shield className="h-4 w-4 mr-1" />
              <span className="text-sm">Nível de acesso</span>
            </div>
            <span className="font-medium">Todos os membros</span>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h2 className="text-2xl font-semibold">O que você vai aprender</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium">Configuração do ambiente</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Como preparar todos os pré-requisitos e ferramentas necessárias para sua solução de IA
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium">Implementação guiada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Passos detalhados e testados para implementação segura e eficiente
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium">Otimização avançada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Técnicas para maximizar o desempenho e eficácia da sua solução
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium">Medição de resultados</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Métricas e KPIs para acompanhar e comprovar o retorno do investimento
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h2 className="text-2xl font-semibold">Esta solução é ideal para você se...</h2>
        <ul className="mt-4 space-y-3">
          <li className="flex items-start p-3 bg-blue-50 rounded-md">
            <ArrowRight className="h-5 w-5 text-viverblue mr-3 mt-0.5 flex-shrink-0" />
            <span>Você quer aumentar a produtividade da sua equipe e reduzir tempo gasto em tarefas repetitivas</span>
          </li>
          <li className="flex items-start p-3 bg-blue-50 rounded-md">
            <ArrowRight className="h-5 w-5 text-viverblue mr-3 mt-0.5 flex-shrink-0" />
            <span>Você busca uma solução pronta para implementar hoje sem depender de equipes técnicas</span>
          </li>
          <li className="flex items-start p-3 bg-blue-50 rounded-md">
            <ArrowRight className="h-5 w-5 text-viverblue mr-3 mt-0.5 flex-shrink-0" />
            <span>Você quer resultados rápidos, mensuráveis e que gerem retorno imediato para o negócio</span>
          </li>
        </ul>
      </div>
      
      <Separator />
      
      <div>
        <h2 className="text-2xl font-semibold">Módulos da implementação</h2>
        <div className="mt-4 grid grid-cols-1 gap-3">
          <div className="flex items-center border rounded-lg p-3 bg-card hover:border-viverblue/60 transition-colors">
            <Badge className="bg-viverblue text-white mr-3">1</Badge>
            <span className="font-medium">Visão Geral e Case Real</span>
          </div>
          <div className="flex items-center border rounded-lg p-3 bg-card hover:border-viverblue/60 transition-colors">
            <Badge className="bg-viverblue text-white mr-3">2</Badge>
            <span className="font-medium">Preparação Express</span>
          </div>
          <div className="flex items-center border rounded-lg p-3 bg-card hover:border-viverblue/60 transition-colors">
            <Badge className="bg-viverblue text-white mr-3">3</Badge>
            <span className="font-medium">Implementação Passo a Passo</span>
          </div>
          <div className="flex items-center border rounded-lg p-3 bg-card hover:border-viverblue/60 transition-colors">
            <Badge className="bg-viverblue text-white mr-3">4</Badge>
            <span className="font-medium">Verificação e Validação</span>
          </div>
          <div className="flex items-center border rounded-lg p-3 bg-card hover:border-viverblue/60 transition-colors">
            <Badge className="bg-viverblue text-white mr-3">5</Badge>
            <span className="font-medium">Primeiros Resultados</span>
          </div>
          <div className="flex items-center border rounded-lg p-3 bg-card hover:border-viverblue/60 transition-colors">
            <Badge className="bg-viverblue text-white mr-3">6</Badge>
            <span className="font-medium">Otimização e Escala</span>
          </div>
          <div className="flex items-center border rounded-lg p-3 bg-card hover:border-viverblue/60 transition-colors">
            <Badge className="bg-viverblue text-white mr-3">7</Badge>
            <span className="font-medium">Celebração e Reconhecimento</span>
          </div>
        </div>
      </div>
    </div>
  );
};
