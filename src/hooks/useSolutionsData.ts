
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";

export const useSolutionsData = (initialCategory = "all") => {
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [filteredSolutions, setFilteredSolutions] = useState<Solution[]>([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        setLoading(true);
        
        // Buscar todas as soluções publicadas
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .eq("published", true);
        
        if (error) {
          throw error;
        }
        
        console.log("Soluções carregadas:", data ? data.length : 0);
        setSolutions(data || []);
      } catch (error) {
        console.error("Erro ao buscar soluções:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolutions();
  }, []);
  
  // Filtrar soluções baseado na categoria e busca
  useEffect(() => {
    let result = [...solutions];
    
    // Aplicar filtro de categoria se não for "all"
    if (activeCategory !== "all") {
      result = result.filter(solution => solution.category === activeCategory);
    }
    
    // Aplicar filtro de busca se houver
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(solution => 
        solution.title?.toLowerCase().includes(query) || 
        solution.description?.toLowerCase().includes(query)
      );
    }
    
    setFilteredSolutions(result);
  }, [solutions, activeCategory, searchQuery]);
  
  // Função de navegação para detalhes
  const navigateToSolutionDetails = (id: string) => {
    navigate(`/solution/${id}`);
  };
  
  return {
    loading,
    solutions,
    filteredSolutions,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    navigateToSolutionDetails
  };
};
