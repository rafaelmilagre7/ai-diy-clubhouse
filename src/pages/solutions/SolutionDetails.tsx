
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, ChevronRight, Clock, Users, Target, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Link } from "react-router-dom";

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  // Em um caso real, buscaríamos os detalhes da solução do backend
  const solution = {
    id,
    title: "Assistente de Atendimento com IA",
    description: "Implemente um assistente de atendimento com IA que pode responder perguntas frequentes dos seus clientes automaticamente, melhorando o tempo de resposta e a satisfação do cliente.",
    category: "revenue",
    difficulty: "medium",
    estimatedTime: "2 horas",
    targetAudience: "Empresas com atendimento ao cliente",
    benefits: [
      "Redução do tempo de resposta",
      "Atendimento 24/7",
      "Escalabilidade do suporte",
      "Redução de custos operacionais"
    ],
    requirements: [
      "Conta em uma plataforma de IA (OpenAI ou similar)",
      "Base de conhecimento ou FAQs existentes",
      "Website ou plataforma para integração"
    ],
    steps: [
      "Preparação de dados e base de conhecimento",
      "Configuração da API de IA",
      "Integração com seu website ou plataforma",
      "Treinamento e testes",
      "Lançamento e monitoramento"
    ]
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "Fácil";
      case "medium": return "Médio";
      case "hard": return "Avançado";
      default: return difficulty;
    }
  };
  
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "revenue": return "Aumento de Receita";
      case "operational": return "Otimização Operacional";
      case "strategy": return "Gestão Estratégica";
      default: return category;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link to="/solutions" className="flex items-center text-muted-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para soluções
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{solution.title}</h1>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                {getCategoryLabel(solution.category)}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(solution.difficulty)}`}>
                {getDifficultyLabel(solution.difficulty)}
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 flex items-center">
                <Clock className="h-3 w-3 mr-1" /> {solution.estimatedTime}
              </span>
            </div>
          </div>
          
          <Button>Iniciar Implementação</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sobre esta solução</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {solution.description}
              </p>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Benefícios</h3>
                <ul className="space-y-1">
                  {solution.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Público-alvo</h3>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  <span>{solution.targetAudience}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Processo de Implementação</CardTitle>
              <CardDescription>
                Um guia passo a passo para implementar esta solução
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {solution.steps.map((step, index) => (
                  <div key={index} className="flex">
                    <div className="h-8 w-8 rounded-full bg-viverblue text-white flex items-center justify-center mr-3">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{step}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Pré-requisitos</CardTitle>
              <CardDescription>
                O que você precisa antes de começar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {solution.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <ChevronRight className="h-4 w-4 mr-2 mt-1 text-viverblue" />
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Verificar Pré-requisitos</Button>
            </CardFooter>
          </Card>
          
          <Alert className="mt-6 bg-yellow-50 border-yellow-100">
            <AlertTriangle className="h-4 w-4 text-yellow-800" />
            <AlertTitle className="text-yellow-800">Implementação recomendada</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Esta solução é melhor implementada se você já tem um website ou plataforma existente.
            </AlertDescription>
          </Alert>
          
          <Alert className="mt-4 bg-blue-50 border-blue-100">
            <Info className="h-4 w-4 text-blue-800" />
            <AlertTitle className="text-blue-800">Suporte disponível</AlertTitle>
            <AlertDescription className="text-blue-700">
              Se precisar de ajuda durante a implementação, conte com o suporte do VIVER DE IA Club.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default SolutionDetails;
