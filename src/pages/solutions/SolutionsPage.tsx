
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Lightbulb, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";

const SolutionsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dados de exemplo para as soluções
  const solutionsMock = [
    {
      id: "1",
      title: "Assistente de Atendimento com IA",
      description: "Implemente um assistente de atendimento com IA que pode responder perguntas frequentes dos seus clientes.",
      category: "revenue",
      difficulty: "medium"
    },
    {
      id: "2",
      title: "Automação de Email Marketing com IA",
      description: "Crie campanhas de email marketing mais eficientes utilizando IA para personalização de conteúdo.",
      category: "operational",
      difficulty: "easy"
    },
    {
      id: "3",
      title: "Análise de Dados de Vendas com IA",
      description: "Utilize IA para analisar dados de vendas e identificar tendências e oportunidades.",
      category: "strategy",
      difficulty: "hard"
    }
  ];

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "revenue": return "Aumento de Receita";
      case "operational": return "Otimização Operacional";
      case "strategy": return "Gestão Estratégica";
      default: return category;
    }
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Soluções</h1>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filtrar
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar soluções..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="revenue">Aumento de Receita</TabsTrigger>
          <TabsTrigger value="operational">Otimização Operacional</TabsTrigger>
          <TabsTrigger value="strategy">Gestão Estratégica</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          {solutionsMock.map(solution => (
            <Card key={solution.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5 text-viverblue" />
                      {solution.title}
                    </CardTitle>
                    <CardDescription className="mt-1">{solution.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {getCategoryLabel(solution.category)}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(solution.difficulty)}`}>
                      {getDifficultyLabel(solution.difficulty)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="flex justify-end pt-0">
                <Button asChild>
                  <Link to={`/solutions/${solution.id}`}>
                    Ver detalhes
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="revenue" className="mt-4">
          {solutionsMock
            .filter(s => s.category === "revenue")
            .map(solution => (
              <Card key={solution.id} className="mb-4">
                {/* Conteúdo similar ao de "all", apenas filtrado */}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="mr-2 h-5 w-5 text-viverblue" />
                        {solution.title}
                      </CardTitle>
                      <CardDescription className="mt-1">{solution.description}</CardDescription>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(solution.difficulty)}`}>
                      {getDifficultyLabel(solution.difficulty)}
                    </span>
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-end pt-0">
                  <Button asChild>
                    <Link to={`/solutions/${solution.id}`}>
                      Ver detalhes
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </TabsContent>
        
        <TabsContent value="operational" className="mt-4">
          {solutionsMock
            .filter(s => s.category === "operational")
            .map(solution => (
              <Card key={solution.id} className="mb-4">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="mr-2 h-5 w-5 text-viverblue" />
                        {solution.title}
                      </CardTitle>
                      <CardDescription className="mt-1">{solution.description}</CardDescription>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(solution.difficulty)}`}>
                      {getDifficultyLabel(solution.difficulty)}
                    </span>
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-end pt-0">
                  <Button asChild>
                    <Link to={`/solutions/${solution.id}`}>
                      Ver detalhes
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </TabsContent>
        
        <TabsContent value="strategy" className="mt-4">
          {solutionsMock
            .filter(s => s.category === "strategy")
            .map(solution => (
              <Card key={solution.id} className="mb-4">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="mr-2 h-5 w-5 text-viverblue" />
                        {solution.title}
                      </CardTitle>
                      <CardDescription className="mt-1">{solution.description}</CardDescription>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(solution.difficulty)}`}>
                      {getDifficultyLabel(solution.difficulty)}
                    </span>
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-end pt-0">
                  <Button asChild>
                    <Link to={`/solutions/${solution.id}`}>
                      Ver detalhes
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SolutionsPage;
