
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

// Este hook não é mais necessário para soluções
// Módulos são apenas para cursos
// Manter apenas para compatibilidade, mas retorna array vazio para soluções

export const useModuleFetch = (solutionId: string | null) => {
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log("⚠️ useModuleFetch: Módulos não são usados em soluções, apenas em cursos");
    setModules([]);
    setIsLoading(false);
  }, [solutionId]);

  const fetchModules = async () => {
    console.log("⚠️ fetchModules: Operação não aplicável para soluções");
  };

  return {
    modules: [],
    setModules,
    isLoading: false,
    fetchModules
  };
};
