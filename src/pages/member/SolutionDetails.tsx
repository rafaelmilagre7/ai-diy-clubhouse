
import { useParams, useLocation } from "react-router-dom";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useSolutionData } from "@/hooks/useSolutionData";
import { SolutionBackButton } from "@/components/solution/SolutionBackButton";
import { SolutionCoverPage } from "@/components/solution/SolutionCoverPage";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { useEffect } from "react";
import { useLogging } from "@/hooks/useLogging";
import { PageTransition } from "@/components/transitions/PageTransition";

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { log, logError } = useLogging();
  
  // Fetch solution data with the updated hook that includes progress
  const { solution, loading, error, progress } = useSolutionData(id);
  
  // Log page visit
  useEffect(() => {
    if (solution) {
      log("Solution details page visited", { 
        solution_id: solution.id, 
        solution_title: solution.title,
        path: location.pathname
      });
    }
  }, [solution, location.pathname, log]);
  
  if (loading) {
    return <LoadingScreen message="Carregando detalhes da solução..." />;
  }
  
  if (!solution) {
    logError("Solution not found", { id });
    return <SolutionNotFound />;
  }
  
  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto pb-12">
        <SolutionBackButton />
        
        <SolutionCoverPage 
          solution={solution}
          progress={progress}
        />
      </div>
    </PageTransition>
  );
};

export default SolutionDetails;
