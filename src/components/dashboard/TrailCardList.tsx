
import React from "react";
import { Button } from "@/components/ui/button";
import { Solution } from "@/lib/supabase";
import { ChevronRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SolutionCardSkeleton } from "./SolutionsGridLoader";
import { motion } from "framer-motion";

interface TrailCardListProps {
  solutions: Solution[];
  onSolutionClick: (id: string) => void;
  onSeeAll: () => void;
  isLoading?: boolean;
}

export const TrailCardList: React.FC<TrailCardListProps> = ({ 
  solutions, 
  onSolutionClick, 
  onSeeAll,
  isLoading = false 
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  // Renderiza cards individuais com animação suave
  return (
    <div className="space-y-4">
      <motion.div 
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {solutions.map((solution: any, index) => (
          <motion.div 
            key={solution.id}
            variants={itemVariants}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
            onClick={() => onSolutionClick(solution.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={solution.priority === 1 ? "destructive" : solution.priority === 2 ? "default" : "outline"}>
                    Prioridade {solution.priority}
                  </Badge>
                  <span className="text-xs text-gray-500">{solution.category}</span>
                </div>
                <h3 className="text-lg font-medium text-gray-800">{solution.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {solution.justification || "Recomendada para seu negócio"}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
            </div>
          </motion.div>
        ))}

        {/* Renderizar skeletons individuais para itens em carregamento */}
        {isLoading && solutions.length === 0 && (
          <>
            <SolutionCardSkeleton />
            <SolutionCardSkeleton />
          </>
        )}
      </motion.div>

      <div className="flex justify-end pt-2">
        <Button variant="ghost" size="sm" onClick={onSeeAll} className="gap-1">
          Ver todas as soluções
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
