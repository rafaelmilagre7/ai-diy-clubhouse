
import { useState, useEffect } from "react";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/contexts/logging";

export const useSolutionsData = (initialCategory: string | null) => {
  const { toast } = useToast();
  const { log, error: logError } = useLogging();
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
        log("Buscando soluções publicadas", {});
        
        const { data, error: fetchError } = await supabase
          .from("solutions")
          .select("*")
          .eq("published", true); // Apenas soluções publicadas
        
        if (fetchError) {
          logError("Erro ao buscar soluções:", fetchError);
          throw fetchError;
        }
        
        if (data && data.length > 0) {
          log(`Encontradas ${data.length} soluções publicadas`, {});
          setSolutions(data as Solution[]);
          setFilteredSolutions(data as Solution[]);
        } else {
          log("Nenhuma solução publicada encontrada", {});
          setSolutions([]);
          setFilteredSolutions([]);
        }
      } catch (error) {
        logError("Erro ao buscar soluções:", error);
        setError("Não foi possível carregar as soluções");
        toast({
          title: "Erro ao carregar soluções",
          description: "Não foi possível carregar as soluções disponíveis.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolutions();
  }, [toast, log, logError]);
  
  // Filter solutions when category or search changes
  useEffect(() => {
    let filtered = [...solutions];
    
    // Filter by category
    if (activeCategory && activeCategory !== "all") {
      filtered = filtered.filter((solution) => solution.category === activeCategory);
      log(`Filtrando soluções por categoria: ${activeCategory}`, { 
        count: filtered.length,
        totalSolutions: solutions.length
      });
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (solution) => {
          const titleMatch = solution.title?.toLowerCase().includes(query) || false;
          const descMatch = solution.description?.toLowerCase().includes(query) || false;
          const tagMatch = solution.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
          
          return titleMatch || descMatch || tagMatch;
        }
      );
      
      log(`Filtrando soluções por busca: "${searchQuery}"`, { 
        count: filtered.length,
        activeCategory
      });
    }
    
    setFilteredSolutions(filtered);
  }, [activeCategory, searchQuery, solutions, log]);

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
