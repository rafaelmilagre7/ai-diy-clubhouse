
import { FC, memo, useEffect } from "react";
import { ActiveSolutions } from "./ActiveSolutions";
import { CompletedSolutions } from "./CompletedSolutions";
import { RecommendedSolutions } from "./RecommendedSolutions";
import { NoSolutionsPlaceholder } from "./NoSolutionsPlaceholder";
import { Solution } from "@/lib/supabase";
import { ModernDashboardHeader } from "./ModernDashboardHeader";
import { KpiGrid } from "./KpiGrid";
import { useAuth } from "@/contexts/auth";
import { AchievementsSummary } from "./AchievementsSummary"; 
import { SolutionsGridLoader } from "./SolutionsGridLoader";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  active: Solution[];
  completed: Solution[];
  recommended: Solution[];
  category: string;
  onCategoryChange: (category: string) => void;
  onSolutionClick: (solution: Solution) => void;
  isLoading?: boolean;
}

// Animações de entrada
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

// Otimização: Usar memo para evitar re-renderizações desnecessárias
export const DashboardLayout: FC<DashboardLayoutProps> = memo(({
  active,
  completed,
  recommended,
  category,
  onCategoryChange,
  onSolutionClick,
  isLoading = false
}) => {
  const hasNoSolutions = !isLoading && active.length === 0 && completed.length === 0 && recommended.length === 0;
  const { profile } = useAuth();
  const userName = profile?.name?.split(" ")[0] || "Membro";
  const queryClient = useQueryClient();
  
  // Prefetch detalhes das soluções para navegação instantânea
  useEffect(() => {
    const allSolutions = [...active, ...completed, ...recommended];
    
    // Prefetch em background com baixa prioridade
    allSolutions.forEach(solution => {
      queryClient.prefetchQuery({
        queryKey: ['solution', solution.id],
        queryFn: async () => solution,
        staleTime: 5 * 60 * 1000 // 5 minutos
      });
    });
  }, [active, completed, recommended, queryClient]);

  return (
    <motion.div 
      className="space-y-8 md:pt-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* HEADER IMERSIVO */}
      <ModernDashboardHeader userName={userName} />

      {/* Resumo gamificação - conquistas */}
      <motion.div variants={itemVariants}>
        <AchievementsSummary />
      </motion.div>

      {/* CARDS DE PROGRESSO (KPI) */}
      <motion.div variants={itemVariants}>
        <KpiGrid 
          completed={completed.length} 
          inProgress={active.length}
          total={active.length + completed.length + recommended.length}
          isLoading={isLoading}
        />
      </motion.div>

      {/* Mostrar loaders enquanto carrega, ou conteúdo quando pronto */}
      {hasNoSolutions ? (
        <motion.div variants={itemVariants}>
          <NoSolutionsPlaceholder />
        </motion.div>
      ) : (
        <>
          {active.length > 0 && (
            <motion.div variants={itemVariants}>
              <ActiveSolutions 
                solutions={active} 
                onSolutionClick={onSolutionClick} 
              />
            </motion.div>
          )}
          
          {completed.length > 0 && (
            <motion.div variants={itemVariants}>
              <CompletedSolutions 
                solutions={completed} 
                onSolutionClick={onSolutionClick} 
              />
            </motion.div>
          )}
          
          {recommended.length > 0 && (
            <motion.div variants={itemVariants}>
              <RecommendedSolutions 
                solutions={recommended} 
                onSolutionClick={onSolutionClick} 
              />
            </motion.div>
          )}
          
          {/* Renderização condicional inline de loaders apenas quando necessário */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <SolutionsGridLoader />
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';
