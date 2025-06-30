
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Target } from 'lucide-react';
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
      className="space-y-8"
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
          Revisão Final
        </h2>
        <p className="text-slate-400">
          Revise suas informações antes de finalizar o processo
        </p>
      </div>

      <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
        <OnboardingPreview data={data} />
      </Card>

      <Card className="p-8 bg-gradient-to-r from-viverblue/10 to-purple-600/10 backdrop-blur-sm border-white/10">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <Target className="w-6 h-6 text-viverblue" />
            <h3 className="text-xl font-semibold text-white">Próximas Etapas</h3>
          </div>
          
          <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Com base no perfil da sua empresa, desenvolveremos uma estratégia personalizada 
            de implementação de IA. Você terá acesso a conteúdos especializados, ferramentas 
            práticas e uma rede exclusiva de executivos inovadores.
          </p>
          
          <div className="pt-4">
            <Button
              onClick={onComplete}
              disabled={isCompleting}
              className="bg-viverblue hover:bg-viverblue/90 text-white px-12 py-4 text-lg font-semibold rounded-lg transition-all"
            >
              {isCompleting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processando...
                </>
              ) : (
                'Finalizar Cadastro'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MockOnboardingStep6;
