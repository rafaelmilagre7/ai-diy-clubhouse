
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useSolutionData } from "@/hooks/useSolutionData";
import LoadingScreen from "@/components/common/LoadingScreen";
import { PageTransition } from "@/components/transitions/PageTransition";
import ImplementationTabsContainer from "@/components/implementation/tabs/ImplementationTabsContainer";
import SolutionBackButton from "@/components/solution/SolutionBackButton";
import SolutionHeaderSection from "@/components/solution/SolutionHeaderSection";

const SolutionImplementation = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch solution data
  const { solution, loading: solutionLoading } = useSolutionData(id);

  // Loading state
  if (solutionLoading) {
    return <LoadingScreen message="Carregando implementação..." />;
  }

  // Error states
  if (!solution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Solução não encontrada</h2>
          <p className="text-muted-foreground">A solução que você está tentando implementar não foi encontrada.</p>
        </Card>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
        {/* Aurora Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        </div>

        <div className="relative max-w-6xl mx-auto p-6 space-y-6">
          <SolutionBackButton />
          <SolutionHeaderSection solution={solution} />
          <ImplementationTabsContainer />
        </div>
      </div>
    </PageTransition>
  );
};

export default SolutionImplementation;
