
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface MinimalOnboardingIncompleteStateProps {
  onNavigateToOnboarding: () => void;
}

export const MinimalOnboardingIncompleteState: React.FC<MinimalOnboardingIncompleteStateProps> = ({
  onNavigateToOnboarding
}) => {
  return (
    <div className="text-center py-8 space-y-6">
      {/* Ícone */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="flex justify-center"
      >
        <div className="bg-amber-100 dark:bg-amber-900/20 p-4 rounded-full">
          <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        </div>
      </motion.div>
      
      {/* Conteúdo */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Complete seu Onboarding
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">
          Para gerar sua trilha personalizada, complete primeiro as informações 
          sobre você e sua empresa no onboarding.
        </p>
      </div>
      
      {/* Botão de ação */}
      <Button 
        onClick={onNavigateToOnboarding}
        className="bg-viverblue hover:bg-viverblue/90 text-white px-6 py-2 flex items-center gap-2 mx-auto"
      >
        <Clock className="h-4 w-4" />
        Completar Onboarding
        <ArrowRight className="h-4 w-4" />
      </Button>
      
      {/* Info adicional */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>⏱️ Tempo estimado: 5-10 minutos</p>
      </div>
    </div>
  );
};
