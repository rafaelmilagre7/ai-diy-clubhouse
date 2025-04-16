
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, Search, CheckCircle, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dados mockados para demonstração
  const solutionCategories = [
    { id: "all", name: "Todas as Soluções" },
    { id: "revenue", name: "Aumento de Receita" },
    { id: "operational", name: "Otimização Operacional" },
    { id: "strategy", name: "Gestão Estratégica" }
  ];
  
  const mockSolutions = [
    {
      id: "1",
      title: "Assistente de Vendas no Instagram",
      description: "Crie um assistente virtual para responder perguntas e aumentar vendas no Instagram",
      category: "revenue",
      difficulty: "iniciante",
      implementationTime: "30 min",
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aW5zdGFncmFtfGVufDB8fDB8fHww"
    },
    {
      id: "2",
      title: "Automação de Atendimento ao Cliente",
      description: "Implemente um sistema automatizado para responder dúvidas frequentes",
      category: "operational",
      difficulty: "intermediário",
      implementationTime: "45 min",
      image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGN1c3RvbWVyJTIwc2VydmljZXxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
      id: "3",
      title: "Análise Preditiva de Vendas",
      description: "Use IA para prever tendências de vendas e otimizar seu estoque",
      category: "strategy",
      difficulty: "avançado",
      implementationTime: "60 min",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hhcnR8ZW58MHx8MHx8fDA%3D"
    },
    {
      id: "4",
      title: "Gerador de Conteúdo para Redes Sociais",
      description: "Crie conteúdo engajador para suas redes sociais em minutos",
      category: "revenue",
      difficulty: "iniciante",
      implementationTime: "20 min",
      image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c29jaWFsJTIwbWVkaWF8ZW58MHx8MHx8fDA%3D"
    },
    {
      id: "5",
      title: "Assistente de Pesquisa de Mercado",
      description: "Obtenha insights valiosos sobre seu mercado e concorrentes",
      category: "strategy",
      difficulty: "intermediário",
      implementationTime: "40 min",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFya2V0JTIwcmVzZWFyY2h8ZW58MHx8MHx8fDA%3D"
    },
    {
      id: "6",
      title: "Otimização de Processos Internos",
      description: "Automatize fluxos de trabalho repetitivos e ganhe produtividade",
      category: "operational",
      difficulty: "avançado",
      implementationTime: "50 min",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvY2Vzc3xlbnwwfHwwfHx8MA%3D%3D"
    }
  ];
  
  const [filteredSolutions, setFilteredSolutions] = useState(mockSolutions);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  
  // Filtrar soluções por categoria e busca
  useEffect(() => {
    let filtered = [...mockSolutions];
    
    if (activeCategory !== "all") {
      filtered = filtered.filter(solution => solution.category === activeCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        solution => 
          solution.title.toLowerCase().includes(query) || 
          solution.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredSolutions(filtered);
  }, [activeCategory, searchQuery]);
  
  // Atualizar categoria ativa quando o parâmetro da URL mudar
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);
  
  const handleSelectSolution = (id: string) => {
    navigate(`/dashboard/solution/${id}`);
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "iniciante":
        return "bg-green-100 text-green-800";
      case "intermediário":
        return "bg-yellow-100 text-yellow-800";
      case "avançado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo, {profile?.name?.split(' ')[0] || "Membro"}!</h1>
          <p className="text-muted-foreground mt-1">
            Escolha uma solução para implementar na sua empresa
          </p>
        </div>
        
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar soluções..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Progress summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-[#0ABAB5]/10 p-2">
                <CheckCircle className="h-6 w-6 text-[#0ABAB5]" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Implementações Completas</p>
                <p className="text-2xl font-bold">2 de 6</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-[#0ABAB5]/10 p-2">
                <Clock className="h-6 w-6 text-[#0ABAB5]" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próxima Implementação</p>
                <p className="text-2xl font-bold">Em andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-[#0ABAB5]/10 p-2">
                <TrendingUp className="h-6 w-6 text-[#0ABAB5]" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Seu Progresso</p>
                <p className="text-2xl font-bold">33%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Category tabs */}
      <div className="space-y-4">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-4">
            {solutionCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeCategory} className="mt-6">
            {filteredSolutions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSolutions.map((solution) => (
                  <Card key={solution.id} className="overflow-hidden transition-shadow hover:shadow-md">
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={solution.image} 
                        alt={solution.title} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(solution.difficulty)}>
                          {solution.difficulty}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>{solution.implementationTime}</span>
                        </div>
                      </div>
                      <CardTitle className="mt-2 line-clamp-1">{solution.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {solution.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button 
                        onClick={() => handleSelectSolution(solution.id)}
                        className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
                      >
                        Implementar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-lg font-medium">Nenhuma solução encontrada</p>
                <p className="text-muted-foreground">
                  Tente ajustar seus filtros ou busca
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
