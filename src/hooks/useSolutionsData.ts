
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

export const useSolutionsData = (options?: { 
  category?: string, 
  publishedOnly?: boolean 
}) => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(options?.category || "all");

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        setLoading(true);
        
        // Iniciar a consulta básica
        let query = supabase.from("solutions").select("*");
        
        // Aplicar filtro por categoria se especificado e não for "all"
        const categoryToFilter = activeCategory !== "all" ? activeCategory : options?.category;
        if (categoryToFilter && categoryToFilter !== "all") {
          query = query.eq("category", categoryToFilter);
        }
        
        // Aplicar filtro para mostrar apenas soluções publicadas (se não for admin)
        if ((options?.publishedOnly !== false) && !isAdmin) {
          query = query.eq("published", true);
        }
        
        // Ordenar por data de criação (mais recentes primeiro)
        query = query.order("created_at", { ascending: false });
        
        const { data, error: fetchError } = await query;
        
        if (fetchError) throw fetchError;
        
        setSolutions(data as Solution[]);
        setError(null);
      } catch (err: any) {
        console.error("Erro ao buscar soluções:", err);
        setError(err);
        toast({
          title: "Erro ao carregar soluções",
          description: "Não foi possível carregar as soluções. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolutions();
  }, [options?.category, options?.publishedOnly, isAdmin, toast, activeCategory]);
  
  // Filtramos as soluções baseado na pesquisa
  const filteredSolutions = useMemo(() => {
    return solutions.filter(solution =>
      solution.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      solution.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [solutions, searchQuery]);
  
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
