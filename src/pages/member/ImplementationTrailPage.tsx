
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { ImplementationTrailCreator } from "@/components/implementation-trail/ImplementationTrailCreator";
import { OnboardingIncompleteState } from "@/components/implementation-trail/OnboardingIncompleteState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ImplementationTrailPage = () => {
  const navigate = useNavigate();
  const { progress, isLoading } = useProgress();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    // Quando os dados estiverem carregados, alterar estado
    if (!isLoading) {
      setIsOnboardingComplete(progress?.is_completed || false);
      // Pequeno delay para animação
      setTimeout(() => setIsPageLoaded(true), 100);
    }
  }, [progress, isLoading]);

  // Enquanto os dados estão carregando, exibir skeleton individualizado
  if (isLoading) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader className="animate-pulse bg-gray-100/10">
            <div className="h-6 w-1/3 bg-gray-200/20 rounded mb-2"></div>
            <div className="h-4 w-2/3 bg-gray-200/10 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin mb-4" />
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se o onboarding não foi concluído, exibir mensagem orientando o usuário
  if (isOnboardingComplete === false) {
    return (
      <AnimatePresence>
        {isPageLoaded && (
          <motion.div 
            className="container py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Trilha de Implementação</CardTitle>
                <CardDescription>
                  Personalize sua experiência no VIVER DE IA Club com uma trilha exclusiva
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OnboardingIncompleteState onNavigateToOnboarding={() => navigate("/onboarding")} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Quando o onboarding estiver completo, exibir o criador de trilha
  return (
    <AnimatePresence>
      {isPageLoaded && (
        <motion.div 
          className="container py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Trilha de Implementação</CardTitle>
              <CardDescription>
                Sua trilha personalizada com base no seu perfil e objetivos de negócio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImplementationTrailCreator />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImplementationTrailPage;
