
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, ArrowRight, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePostOnboarding } from '@/hooks/onboarding/usePostOnboarding';

const OnboardingCompletedNew: React.FC = () => {
  const navigate = useNavigate();
  const { 
    goToImplementationTrail, 
    goToDashboard, 
    markFirstDashboardAccess 
  } = usePostOnboarding();

  useEffect(() => {
    // Marcar como primeiro acesso
    markFirstDashboardAccess();
  }, [markFirstDashboardAccess]);

  return (
    <div className="min-h-screen bg-[#0F111A] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-gradient-to-br from-viverblue/10 via-gray-800/50 to-viverblue/5 border-viverblue/20 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8 px-8 text-center space-y-6">
            {/* Ícone de sucesso */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="relative">
                <CheckCircle className="h-20 w-20 text-green-500" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="h-8 w-8 text-viverblue" />
                </motion.div>
              </div>
            </motion.div>

            {/* Título */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">
                Bem-vindo ao VIVER DE IA Club! 🎉
              </h1>
              <p className="text-gray-300 text-lg">
                Seu onboarding foi concluído com sucesso
              </p>
            </div>

            {/* Descrição */}
            <div className="bg-gray-800/30 rounded-lg p-6 space-y-3">
              <p className="text-gray-300">
                Agora você tem acesso completo à nossa plataforma com:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Trilha personalizada com IA</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Soluções exclusivas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Comunidade de empresários</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Ferramentas e recursos</span>
                </div>
              </div>
            </div>

            {/* Próximos passos */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">
                Qual seu próximo passo?
              </h3>
              
              <div className="grid gap-3">
                <Button
                  onClick={goToImplementationTrail}
                  className="bg-viverblue hover:bg-viverblue/90 text-white flex items-center justify-center gap-2 py-6"
                >
                  <Target className="h-5 w-5" />
                  Ver minha trilha personalizada
                  <ArrowRight className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={goToDashboard}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 py-6"
                >
                  Ir para o Dashboard
                </Button>
              </div>
            </div>

            {/* CTA adicional */}
            <div className="pt-4 border-t border-gray-700/50">
              <p className="text-sm text-gray-400">
                💡 Dica: Comece pela sua trilha personalizada para obter os melhores resultados
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default OnboardingCompletedNew;
