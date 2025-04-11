
import { useState, useEffect } from "react";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useSolutionsData = (initialCategory: string | null) => {
  const { toast } = useToast();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [filteredSolutions, setFilteredSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || "all");
  const [error, setError] = useState<string | null>(null);
  
  // Fetch solutions
  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        setLoading(true);
        
        // First try to check if the user is authenticated
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          // If no session, show a friendly error and redirect to login after a delay
          setError("Sessão expirada. Redirecionando para o login...");
          setTimeout(() => {
            localStorage.removeItem('supabase.auth.token');
            window.location.href = '/login';
          }, 3000);
          return;
        }
        
        // If session exists, try to fetch solutions
        let query = supabase
          .from("solutions")
          .select("*")
          .eq("published", true);
        
        const { data, error: fetchError } = await query;
        
        if (fetchError) {
          if (fetchError.message.includes("infinite recursion")) {
            // This is a policy error - we need to handle it gracefully
            setError("Erro na política de segurança do banco de dados. Por favor, contate o administrador.");
            toast({
              title: "Erro no servidor",
              description: "Há um problema com as políticas de segurança no banco de dados.",
              variant: "destructive",
            });
            
            // Set some mock data to allow the interface to work
            setSolutions([]);
            setFilteredSolutions([]);
          } else {
            throw fetchError;
          }
        } else {
          setSolutions(data as Solution[]);
          setFilteredSolutions(data as Solution[]);
        }
      } catch (error: any) {
        console.error("Error fetching solutions:", error);
        setError(error.message || "Erro ao carregar soluções");
        toast({
          title: "Erro ao carregar soluções",
          description: "Ocorreu um erro ao tentar carregar as soluções disponíveis.",
          variant: "destructive",
        });
        
        // Set empty arrays to prevent undefined errors
        setSolutions([]);
        setFilteredSolutions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolutions();
  }, [toast]);
  
  // Filter solutions when category or search changes
  useEffect(() => {
    let filtered = [...solutions];
    
    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter((solution) => solution.category === activeCategory);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (solution) =>
          solution.title?.toLowerCase().includes(query) ||
          solution.description?.toLowerCase().includes(query)
      );
    }
    
    setFilteredSolutions(filtered);
  }, [activeCategory, searchQuery, solutions]);

  return {
    solutions,
    filteredSolutions,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory
  };
};
