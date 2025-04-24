
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase/types";
import { LoadingPage } from "@/components/ui/loading-states";
import { useAuth } from "@/contexts/auth";
import DiagnosticPanel from "@/components/common/DiagnosticPanel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estado para soluções
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [hasError, setHasError] = useState(false);
  
  // Buscar soluções usando react-query
  const { isLoading, error } = useQuery({
    queryKey: ['solutions'],
    queryFn: async () => {
      console.log("Buscando soluções...");
      try {
        const { data, error } = await supabase
          .from('solutions')
          .select('*')
          .eq('published', true);
        
        if (error) {
          console.error("Erro ao buscar soluções:", error);
          toast.error("Erro ao carregar soluções");
          setHasError(true);
          throw error;
        }
        
        console.log("Soluções carregadas:", data);
        setSolutions(data || []);
        return data;
      } catch (err) {
        setHasError(true);
        throw err;
      }
    },
    enabled: !!user,
    retry: 1,
  });
  
  // Categorizar soluções
  const categorizedSolutions = {
    active: solutions.filter(s => s.published),
    recommended: solutions.filter(s => s.published).slice(0, 3),
    completed: []
  };
  
  const [category, setCategory] = useState<string>(
    searchParams.get("category") || "recommended"
  );
  
  // Função para lidar com a mudança de categoria
  const handleCategoryChange = useCallback((newCategory: string) => {
    console.log("Mudando categoria para:", newCategory);
    setCategory(newCategory);
    setSearchParams({ category: newCategory });
  }, [setSearchParams]);

  // Função para navegar para a página de detalhes da solução
  const handleSolutionClick = useCallback((solution: Solution) => {
    console.log("Clicou na solução:", solution.id);
    navigate(`/solutions/${solution.id}`);
  }, [navigate]);

  // Efeito para mostrar toast na primeira visita - executado apenas 1 vez
  useEffect(() => {
    const isFirstVisit = localStorage.getItem("firstDashboardVisit") !== "false";
    
    if (isFirstVisit) {
      toast("Bem-vindo ao seu dashboard personalizado!");
      localStorage.setItem("firstDashboardVisit", "false");
    }
    
    console.log("Dashboard montado");
  }, []);

  // Mostrar tela de carregamento enquanto os dados estão sendo carregados
  if (isLoading) {
    return (
      <LoadingPage 
        message="Carregando seu dashboard" 
        description="Estamos preparando sua experiência personalizada do VIVER DE IA Club..." 
      />
    );
  }

  console.log("Renderizando dashboard com categoria:", category);
  console.log("Soluções categorizadas:", categorizedSolutions);

  return (
    <>
      {hasError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de conexão</AlertTitle>
          <AlertDescription>
            Não conseguimos conectar ao servidor. Verifique as configurações e tente novamente.
          </AlertDescription>
        </Alert>
      )}
      
      <DashboardLayout
        solutions={categorizedSolutions}
        isLoading={isLoading}
        onCategoryChange={handleCategoryChange}
        onSolutionClick={handleSolutionClick}
        currentCategory={category}
      />
      
      <DiagnosticPanel />
    </>
  );
};

export default Dashboard;
