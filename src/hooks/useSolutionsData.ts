
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
        
        const { data, error: fetchError } = await supabase
          .from("solutions")
          .select("*");
        
        if (fetchError) {
          console.error("Erro ao buscar soluções:", fetchError);
          throw fetchError;
        }
        
        if (data && data.length > 0) {
          setSolutions(data as Solution[]);
          setFilteredSolutions(data as Solution[]);
        }
      } catch (error) {
        console.error("Erro ao buscar soluções:", error);
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
  }, [toast]);
  
  // Filter solutions when category or search changes
  useEffect(() => {
    let filtered = [...solutions];
    
    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter((solution) => solution.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (solution) =>
          solution.title.toLowerCase().includes(query) ||
          solution.description.toLowerCase().includes(query) ||
          solution.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          false
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
