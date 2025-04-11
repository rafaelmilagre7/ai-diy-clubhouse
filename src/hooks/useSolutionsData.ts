
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
  
  // Fetch solutions
  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from("solutions")
          .select("*")
          .eq("published", true);
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setSolutions(data as Solution[]);
        setFilteredSolutions(data as Solution[]);
      } catch (error) {
        console.error("Error fetching solutions:", error);
        toast({
          title: "Erro ao carregar soluções",
          description: "Ocorreu um erro ao tentar carregar as soluções disponíveis.",
          variant: "destructive",
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
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (solution) =>
          solution.title.toLowerCase().includes(query) ||
          solution.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredSolutions(filtered);
  }, [activeCategory, searchQuery, solutions]);

  return {
    solutions,
    filteredSolutions,
    loading,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory
  };
};
