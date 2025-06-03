
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import canvas_confetti from "canvas-confetti";

interface CompletionFeedbackProps {
  isVisible: boolean;
  sectionName: string;
  onContinue: () => void;
  showConfetti?: boolean;
}

export const CompletionFeedback = ({ 
  isVisible, 
  sectionName, 
  onContinue,
  showConfetti = true 
}: CompletionFeedbackProps) => {
  const [showContinueButton, setShowContinueButton] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Trigger confetti
      if (showConfetti) {
        canvas_confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      // Show continue button after animation
      const timer = setTimeout(() => {
        setShowContinueButton(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      setShowContinueButton(false);
    }
  }, [isVisible, showConfetti]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <Card className="bg-background border-viverblue/30 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <div className="relative inline-flex">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="w-6 h-6 text-viverblue" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl font-semibold mb-2"
              >
                Seção Concluída!
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-gray-600 dark:text-gray-400 mb-6"
              >
                Você completou com sucesso a seção <strong>{sectionName}</strong>. 
                Parabéns pelo progresso!
              </motion.p>

              <AnimatePresence>
                {showContinueButton && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={onContinue}
                    className="bg-viverblue hover:bg-viverblue-dark text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
