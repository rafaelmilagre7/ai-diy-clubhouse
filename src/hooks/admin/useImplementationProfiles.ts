
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";

export const useImplementationProfiles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { log, logError } = useLogging();

  const {
    data: profiles = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["implementation-profiles"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("implementation_profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        log("Perfis de implementação carregados", { count: data?.length });
        return data || [];
      } catch (err) {
        logError("Erro ao carregar perfis", err);
        toast({
          title: "Erro ao carregar perfis",
          description: "Não foi possível carregar os perfis de implementação.",
          variant: "destructive",
        });
        throw err;
      }
    },
  });

  const filteredProfiles = profiles.filter((profile) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      profile.name?.toLowerCase().includes(searchLower) ||
      profile.email?.toLowerCase().includes(searchLower) ||
      profile.company_name?.toLowerCase().includes(searchLower)
    );
  });

  return {
    profiles: filteredProfiles,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    refetch,
  };
};
