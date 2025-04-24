
import { useParams, useNavigate } from "react-router-dom";
import { useCentralDataStore } from "@/hooks/useCentralDataStore";
import { useSolutionInteractions } from "@/hooks/useSolutionInteractions";
import { SolutionBackButton } from "@/components/solution/SolutionBackButton";
import { SolutionHeaderSection } from "@/components/solution/SolutionHeaderSection";
import SolutionTabsContent from "@/components/solution/tabs/SolutionTabsContent";
import { SolutionSidebar } from "@/components/solution/SolutionSidebar";
import { SolutionMobileActions } from "@/components/solution/SolutionMobileActions";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { useEffect } from "react";
import { useLogging } from "@/hooks/useLogging";
import { useQuery } from "@tanstack/react-query";
import { adaptSolutionType } from "@/utils/typeAdapters";
import { Solution } from "@/types/solution";

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { log } = useLogging("SolutionDetails");
  
  const { fetchSolutionDetails } = useCentralDataStore();
  
  const { 
    data: solutionData, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['solution', id],
    queryFn: async () => {
      if (!id) return null;
      // Alteramos para garantir que retornamos os dados e não a função em si
      const solutionData = await fetchSolutionDetails(id);
      return solutionData;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  });
  
  // Adaptar o tipo de Solution do Supabase para o tipo Solution da aplicação
  const solution: Solution | null = solutionData ? adaptSolutionType(solutionData) : null;
  
  const { 
    initializing, 
    startImplementation, 
    continueImplementation, 
    toggleFavorite, 
    downloadMaterials,
    progress
  } = useSolutionInteractions(id || "", solution);

  // Verificar ID inválido ou ausente
  if (!id) {
    navigate("/solutions");
    return null;
  }

  // Mostrar carregamento para melhor experiência do usuário
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto pb-12">
        <SolutionBackButton />
        <div className="mt-8 flex justify-center">
          <div className="animate-pulse text-center">
            <p>Carregando solução...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar erro se não encontrarmos a solução
  if (!solution || error) {
    return <SolutionNotFound />;
  }

  // Mostramos diretamente o conteúdo com fade-in suave
  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
      <SolutionBackButton />
      
      <SolutionHeaderSection solution={solution} />
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <SolutionTabsContent solution={solution} progress={progress} />
          
          <SolutionMobileActions 
            solutionId={solution.id}
            progress={progress}
            startImplementation={() => startImplementation()}
            continueImplementation={() => continueImplementation()}
            initializing={initializing}
          />
        </div>
        
        <div className="md:col-span-1">
          <SolutionSidebar 
            solution={solution}
            progress={progress}
            startImplementation={() => startImplementation()}
            continueImplementation={() => continueImplementation()}
            initializing={initializing}
          />
        </div>
      </div>
    </div>
  );
};

export default SolutionDetails;
