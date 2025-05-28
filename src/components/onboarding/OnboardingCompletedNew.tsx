
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, TrendingUp, Users, ArrowRight, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useOnboardingCompletion } from "@/hooks/onboarding/useOnboardingCompletion";
import { toast } from "sonner";

export const OnboardingCompletedNew: React.FC = () => {
  const navigate = useNavigate();
  const { forceCompleteOnboarding, isCompleting } = useOnboardingCompletion();
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const completeOnboarding = async () => {
      if (!hasCompleted) {
        const success = await forceCompleteOnboarding();
        if (success) {
          setHasCompleted(true);
        }
      }
    };

    completeOnboarding();
  }, [forceCompleteOnboarding, hasCompleted]);

  const handleContinue = () => {
    toast.success("Redirecionando para seu dashboard...");
    navigate("/dashboard");
  };

  const handleRetry = async () => {
    const success = await forceCompleteOnboarding();
    if (success) {
      setHasCompleted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] via-[#151823] to-[#1a1d2e] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-viverblue/20 bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <CheckCircle className="h-20 w-20 text-green-500" />
                <div className="absolute inset-0 h-20 w-20 border-4 border-green-500/20 rounded-full animate-ping" />
              </div>
            </motion.div>
            
            <CardTitle className="text-3xl font-bold text-white mb-2">
              🎉 Onboarding Concluído!
            </CardTitle>
            
            <p className="text-gray-300 text-lg">
              Seja bem-vindo ao VIVER DE IA Club! Sua jornada de implementação de IA começa agora.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {isCompleting && !hasCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <RefreshCw className="h-8 w-8 text-viverblue animate-spin mx-auto mb-2" />
                <p className="text-gray-300">Finalizando configuração...</p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-viverblue/10 p-4 rounded-lg border border-viverblue/20"
              >
                <Sparkles className="h-8 w-8 text-viverblue mb-2" />
                <h3 className="font-semibold text-white">Trilha Personalizada</h3>
                <p className="text-sm text-gray-300">
                  Sua trilha de implementação foi gerada com base no seu perfil
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-green-500/10 p-4 rounded-lg border border-green-500/20"
              >
                <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-semibold text-white">Soluções de IA</h3>
                <p className="text-sm text-gray-300">
                  Acesso ao catálogo completo de soluções práticas
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20"
              >
                <Users className="h-8 w-8 text-purple-500 mb-2" />
                <h3 className="font-semibold text-white">Networking</h3>
                <p className="text-sm text-gray-300">
                  Conecte-se com outros empresários implementando IA
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-700/50 p-4 rounded-lg"
            >
              <h4 className="font-semibold text-white mb-2">🚀 Próximos Passos:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Explore sua trilha de implementação personalizada</li>
                <li>• Navegue pelo catálogo de soluções</li>
                <li>• Participe da comunidade no fórum</li>
                <li>• Configure seu perfil de networking</li>
              </ul>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {!hasCompleted && !isCompleting && (
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              )}
              
              <Button
                onClick={handleContinue}
                disabled={isCompleting}
                className="flex-1 bg-viverblue hover:bg-viverblue/90"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Ir para Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
