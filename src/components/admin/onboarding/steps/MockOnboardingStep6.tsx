
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { OnboardingPreview } from '@/components/onboarding/components/OnboardingPreview';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface MockOnboardingStep6Props {
  data: OnboardingData;
  onComplete: () => Promise<void>;
  isCompleting: boolean;
}

const MockOnboardingStep6: React.FC<MockOnboardingStep6Props> = ({
  data,
  onComplete,
  isCompleting
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-8 h-8 text-green-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Finalização
        </h2>
        <p className="text-slate-400">
          Revise suas informações e finalize seu onboarding
        </p>
      </div>

      <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
        <OnboardingPreview data={data} />
      </Card>

      <Card className="p-6 bg-gradient-to-r from-viverblue/20 to-purple-600/20 backdrop-blur-sm border-white/10">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-viverblue" />
            <h3 className="text-lg font-semibold text-white">Próximos Passos</h3>
            <Sparkles className="w-5 h-5 text-viverblue" />
          </div>
          
          <p className="text-slate-300 max-w-2xl mx-auto">
            Com base no seu perfil, criaremos uma trilha personalizada de implementação de IA 
            para sua empresa. Você receberá acesso a conteúdos, ferramentas e uma comunidade 
            exclusiva de empreendedores inovadores.
          </p>
          
          <div className="pt-4">
            <Button
              onClick={onComplete}
              disabled={isCompleting}
              className="bg-viverblue hover:bg-viverblue/90 text-white px-8 py-3 text-lg font-semibold"
            >
              {isCompleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Finalizando...
                </>
              ) : (
                'Finalizar Onboarding'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MockOnboardingStep6;
