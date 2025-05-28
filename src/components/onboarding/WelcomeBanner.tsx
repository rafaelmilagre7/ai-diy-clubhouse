
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles, ArrowRight, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePostOnboarding } from "@/hooks/onboarding/usePostOnboarding";

export const WelcomeBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { isFirstAccess, goToImplementationTrail, markFirstDashboardAccess } = usePostOnboarding();

  useEffect(() => {
    if (isFirstAccess) {
      setIsVisible(true);
    }
  }, [isFirstAccess]);

  const handleDismiss = () => {
    setIsVisible(false);
    markFirstDashboardAccess();
  };

  const handleGoToTrail = () => {
    setIsVisible(false);
    markFirstDashboardAccess();
    goToImplementationTrail();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-[#0ABAB5]/10 to-purple-500/10 border-[#0ABAB5]/20 shadow-lg">
            <CardContent className="p-6 relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex items-start gap-4 pr-8">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#0ABAB5] to-purple-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    🎉 Bem-vindo ao Viver de IA!
                  </h3>
                  <p className="text-neutral-300 mb-4">
                    Parabéns por completar o onboarding! Sua trilha personalizada de implementação está pronta. 
                    Que tal começar sua jornada de transformação com IA agora mesmo?
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={handleGoToTrail}
                      className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-white gap-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Ver Minha Trilha
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={handleDismiss}
                      className="border-[#0ABAB5]/30 text-[#0ABAB5] hover:bg-[#0ABAB5]/10 gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Explorar Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
