
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, FileText, Video, CheckSquare, List, AlertTriangle, BarChart, Zap, Award } from "lucide-react";

interface ModuleGuideProps {
  moduleType: string;
}

const ModuleGuide: React.FC<ModuleGuideProps> = ({ moduleType }) => {
  // Obter o ícone apropriado baseado no tipo do módulo
  const getIcon = () => {
    switch (moduleType) {
      case "landing":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "overview":
        return <Video className="h-5 w-5 text-purple-500" />;
      case "preparation":
        return <CheckSquare className="h-5 w-5 text-green-500" />;
      case "implementation":
        return <List className="h-5 w-5 text-indigo-500" />;
      case "verification":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "results":
        return <BarChart className="h-5 w-5 text-aurora-primary" />;
      case "optimization":
        return <Zap className="h-5 w-5 text-orange-500" />;
      case "celebration":
        return <Award className="h-5 w-5 text-pink-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Obter orientações específicas baseado no tipo do módulo
  const getGuidance = () => {
    switch (moduleType) {
      case "landing":
        return {
          title: "Landing da Solução",
          description: "Este módulo é a primeira impressão da solução para o membro.",
          tips: [
            "Destaque 3-5 benefícios principais da solução",
            "Use linguagem orientada a resultados",
            "Especifique quem é o público-alvo ideal para esta solução",
            "Inclua uma estimativa de tempo realista para implementação"
          ]
        };
      case "overview":
        return {
          title: "Visão Geral e Case Real",
          description: "Apresente a solução em detalhes e demonstre resultados reais.",
          tips: [
            "Inclua um vídeo explicativo de 2-5 minutos",
            "Detalhe para quem a solução é ideal",
            "Compartilhe um estudo de caso com métricas antes/depois",
            "Explique exatamente o que será implementado"
          ]
        };
      case "preparation":
        return {
          title: "Preparação Express",
          description: "Liste todos os pré-requisitos para implementação bem-sucedida.",
          tips: [
            "Crie um checklist claro de requisitos",
            "Forneça templates e recursos prontos para download",
            "Inclua links para ferramentas recomendadas",
            "Adicione alternativas para cada ferramenta quando possível"
          ]
        };
      case "implementation":
        return {
          title: "Implementação Passo a Passo",
          description: "Guie o membro através de cada etapa da implementação.",
          tips: [
            "Divida em passos pequenos e gerenciáveis",
            "Adicione screenshots ou vídeos para cada passo",
            "Estime o tempo para cada etapa individualmente",
            "Use linguagem clara e evite jargões técnicos desnecessários"
          ]
        };
      case "verification":
        return {
          title: "Verificação de Implementação",
          description: "Ajude o membro a verificar se implementou corretamente.",
          tips: [
            "Crie um checklist de critérios de sucesso",
            "Adicione exemplos visuais do resultado esperado",
            "Inclua uma seção de troubleshooting para problemas comuns",
            "Forneça orientações para testes de validação"
          ]
        };
      case "results":
        return {
          title: "Primeiros Resultados",
          description: "Oriente como medir e comunicar o sucesso inicial.",
          tips: [
            "Especifique métricas chave para acompanhamento",
            "Forneça um template para comunicação interna",
            "Sugira um cronograma de verificação de resultados",
            "Inclua benchmarks para comparação"
          ]
        };
      case "optimization":
        return {
          title: "Otimização Rápida",
          description: "Ofereça dicas para melhorar a solução após implementação inicial.",
          tips: [
            "Sugira 3-5 melhorias de alto impacto",
            "Mostre exemplos de antes/depois da otimização",
            "Compartilhe prompts ou códigos avançados",
            "Recomende integrações com outras ferramentas"
          ]
        };
      case "celebration":
        return {
          title: "Celebração e Próximos Passos",
          description: "Reconheça a conquista e indique caminhos para continuar.",
          tips: [
            "Crie um certificado personalizado",
            "Destaque o valor conquistado com números",
            "Sugira 2-3 soluções complementares",
            "Forneça recursos adicionais para aprofundamento"
          ]
        };
      default:
        return {
          title: "Guia de Módulo",
          description: "Orientações para criação de conteúdo efetivo.",
          tips: [
            "Defina claramente o objetivo do módulo",
            "Use linguagem simples e direta",
            "Inclua elementos visuais quando possível",
            "Mantenha o foco em resultados práticos"
          ]
        };
    }
  };

  const guidance = getGuidance();

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div>
            <h3 className="font-medium text-blue-800">{guidance.title}</h3>
            <p className="text-sm text-blue-700 mt-1">{guidance.description}</p>
            
            <div className="mt-3 space-y-2">
              <h4 className="text-sm font-medium text-blue-800">Dicas para este módulo:</h4>
              <ul className="space-y-1">
                {guidance.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                    <span className="inline-block h-4 w-4 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs mt-0.5">
                      {index + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleGuide;
