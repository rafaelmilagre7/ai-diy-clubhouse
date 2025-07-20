import React, { useState, useEffect } from "react";
import { Module } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useSolutionProgress } from "@/hooks/useSolutionProgress";
import { useParams, useNavigate } from "react-router-dom";

interface ImplementationCompleteProps {
  module: Module;
  onComplete: () => void;
  onPrevious: () => void;
}

export const ImplementationComplete = ({ module, onComplete, onPrevious }: ImplementationCompleteProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [completing, setCompleting] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { progress: currentProgress } = useSolutionProgress(id || "");

  useEffect(() => {
    // Simulate confetti effect on mount
    setShowConfetti(true);
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000); // Adjust timing as needed

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = async () => {
    setCompleting(true);
    try {
      await onComplete();
    } catch (error) {
      console.error("Erro ao completar o módulo:", error);
      // Lidar com erros aqui, como exibir uma mensagem de erro
    } finally {
      setCompleting(false);
    }
  };
  return (
    <div className="relative min-h-[400px] flex items-center justify-center">
      {/* Background Aurora Effect */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-viverblue/10 via-transparent to-viverblue-dark/15" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-viverblue/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-viverblue-dark/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}} />
      </div>

      {/* Content */}
      <div className="relative text-center space-y-8 p-8">
        {/* Animated Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            delay: 0.2 
          }}
          className="mx-auto w-24 h-24 bg-gradient-to-br from-viverblue/20 to-viverblue-dark/25 rounded-full flex items-center justify-center border border-viverblue/30 shadow-2xl shadow-viverblue/20"
        >
          <CheckCircle2 className="h-12 w-12 text-viverblue-light drop-shadow-[0_0_8px_rgba(0,188,212,0.4)]" />
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-viverblue-light to-viverblue bg-clip-text text-transparent">
            Módulo Concluído!
          </h2>
          <p className="text-lg text-neutral-300 max-w-md mx-auto leading-relaxed">
            Parabéns! Você completou este módulo com sucesso. 
            {currentProgress < 100 ? " Continue para o próximo passo da sua jornada." : " Você concluiu toda a implementação!"}
          </p>
        </motion.div>

        {/* Progress Display */}
        {currentProgress > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Progresso Total</span>
              <span className="text-viverblue-light font-medium">{Math.round(currentProgress)}%</span>
            </div>
            <div className="w-full bg-neutral-700/50 rounded-full h-2 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-viverblue to-viverblue-dark rounded-full shadow-lg shadow-viverblue/30"
                initial={{ width: 0 }}
                animate={{ width: `${currentProgress}%` }}
                transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            variant="outline"
            onClick={onPrevious}
            className="text-neutral-300 border-neutral-600 hover:border-viverblue/50 hover:text-viverblue-light hover:bg-viverblue/10 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Módulo Anterior
          </Button>
          
          <Button
            onClick={handleContinue}
            disabled={completing}
            className="bg-gradient-to-r from-viverblue to-viverblue-dark hover:from-viverblue-light hover:to-viverblue text-white border-0 shadow-lg hover:shadow-viverblue/25 transition-all duration-300 px-8"
          >
            {completing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : currentProgress >= 100 ? (
              <>
                <Trophy className="h-4 w-4 mr-2" />
                Finalizar Implementação
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4 mr-2" />
                Próximo Módulo
              </>
            )}
          </Button>
        </motion.div>

        {/* Celebration Confetti Effect */}
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Add confetti animation or particles here if needed */}
          </motion.div>
        )}
      </div>
    </div>
  );
};
