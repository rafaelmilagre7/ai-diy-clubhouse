
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

// Animações de entrada otimizadas para performance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05,
      duration: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 }
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
  const { profile, user } = useAuth();
  const userName = profile?.name?.split(" ")[0] || "Membro";
  const queryClient = useQueryClient();
  
  // Prefetch agressivo para navegação instantânea
  useEffect(() => {
    // Prefetch de todos os detalhes de solução em background
    const allSolutions = [...active, ...completed, ...recommended];
    
    allSolutions.forEach(solution => {
      queryClient.prefetchQuery({
        queryKey: ['solution', solution.id],
        queryFn: async () => solution,
        staleTime: 5 * 60 * 1000 // 5 minutos
      });
    });
    
    // Prefetch trilha de implementação para transição instantânea
    queryClient.prefetchQuery({
      queryKey: ['implementation-trail'],
      queryFn: async () => {
        const { supabase } = await import('@/lib/supabase');
        if (!user) return null;
        
        const { data } = await supabase
          .from("implementation_trails")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        return data;
      },
      staleTime: 1 * 60 * 1000 // 1 minuto
    });
  }, [active, completed, recommended, queryClient, user]);

  return (
    <motion.div 
      className="space-y-8 md:pt-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* HEADER IMERSIVO */}
      <motion.div variants={itemVariants}>
        <ModernDashboardHeader userName={userName} />
      </motion.div>

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

      {/* Mostrar conteúdo existente primeiro, atualizar conforme dados chegam */}
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
        </>
      )}
    </motion.div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';
