
import React from "react";
import { Solution } from "@/lib/supabase";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SolutionsListProps {
  solutions: Solution[];
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
}

export const SolutionsList = ({ 
  solutions, 
  isLoading, 
  error,
  onRetry
}: SolutionsListProps) => {
  const navigate = useNavigate();

  // Função para navegar para a página da solução
  const handleViewSolution = (id: string) => {
    navigate(`/solutions/${id}`);
  };

  // Exibir mensagem de carregamento
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // Exibir mensagem de erro
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar soluções</AlertTitle>
        <AlertDescription>
          <p>Não foi possível carregar as soluções. Por favor, tente novamente.</p>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Tentar novamente
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Exibir mensagem se não houver soluções
  if (!solutions || solutions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Nenhuma solução disponível no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Renderizar a lista de soluções
  return (
    <div className="space-y-4">
      {solutions.map((solution) => (
        <Card key={solution.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{solution.title}</h3>
              <Badge variant="outline">
                {solution.category === "revenue" ? "Aumento de Receita" : 
                 solution.category === "operational" ? "Otimização Operacional" : 
                 solution.category === "strategy" ? "Gestão Estratégica" : 
                 solution.category}
              </Badge>
            </div>
            <p className="text-muted-foreground line-clamp-2">
              {solution.description}
            </p>
          </CardContent>
          <CardFooter className="px-6 pb-6 pt-0 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => handleViewSolution(solution.id)}
            >
              Ver detalhes
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default SolutionsList;
