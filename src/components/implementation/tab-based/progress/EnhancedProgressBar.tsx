
import React from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock } from "lucide-react";

interface EnhancedProgressBarProps {
  completedSections: number;
  totalSections: number;
  currentSection: string;
  estimatedTimeRemaining?: string;
}

export const EnhancedProgressBar = ({ 
  completedSections, 
  totalSections, 
  currentSection,
  estimatedTimeRemaining = "5-10 min"
}: EnhancedProgressBarProps) => {
  const progressPercentage = (completedSections / totalSections) * 100;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <motion.div
              animate={{ rotate: completedSections === totalSections ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle className={`w-6 h-6 ${
                completedSections === totalSections ? 'text-green-500' : 'text-gray-400'
              }`} />
            </motion.div>
            Progresso da Implementação
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Seção atual: <span className="font-medium text-viverblue">{currentSection}</span>
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-viverblue">
            {completedSections}/{totalSections}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {estimatedTimeRemaining}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Progress 
          value={progressPercentage} 
          className="h-3" 
          indicatorClassName="bg-gradient-to-r from-viverblue to-green-500 transition-all duration-500"
        />
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>Início</span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-medium"
          >
            {Math.round(progressPercentage)}% concluído
          </motion.span>
          <span>Finalização</span>
        </div>
      </div>
      
      {completedSections === totalSections && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700"
        >
          <p className="text-sm text-green-800 dark:text-green-300 font-medium text-center">
            🎉 Implementação concluída com sucesso!
          </p>
        </motion.div>
      )}
    </div>
  );
};
