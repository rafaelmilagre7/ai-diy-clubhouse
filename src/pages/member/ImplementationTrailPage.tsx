
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { ImplementationTrailCreator } from "@/components/implementation-trail/ImplementationTrailCreator";
import { OnboardingIncompleteState } from "@/components/implementation-trail/OnboardingIncompleteState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

const ImplementationTrailPage = () => {
  const navigate = useNavigate();
  const { progress, isLoading } = useProgress();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const queryClient = useQueryClient();

  // Prefetch dados do onboarding instantaneamente
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['onboarding-progress'],
      queryFn: () => Promise.resolve(progress),
      staleTime: 60 * 1000 // 1 minuto
    });
  }, [queryClient, progress]);

  useEffect(() => {
    // Quando os dados estiverem carregados, alterar estado imediatamente
    if (!isLoading) {
      setIsOnboardingComplete(progress?.is_completed || false);
      setIsPageLoaded(true);
    } else if (progress) {
      // Mesmo durante loading, se já tivermos dados, mostrar imediatamente
      setIsOnboardingComplete(progress.is_completed || false);
      setIsPageLoaded(true);
    }
  }, [progress, isLoading]);

  // Renderização instantânea mesmo enquanto dados carregam
  return (
    <motion.div 
      className="container py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Trilha de Implementação</CardTitle>
          <CardDescription>
            Personalize sua experiência no VIVER DE IA Club com uma trilha exclusiva
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Decisão instantânea baseada em cache ou dados locais */}
          {isOnboardingComplete === false ? (
            <OnboardingIncompleteState onNavigateToOnboarding={() => navigate("/onboarding")} />
          ) : (
            <ImplementationTrailCreator />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ImplementationTrailPage;
