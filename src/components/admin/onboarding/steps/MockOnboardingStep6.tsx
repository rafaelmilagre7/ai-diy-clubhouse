
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Target, Brain, Sparkles, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedOnboardingPreview } from '@/components/onboarding/components/EnhancedOnboardingPreview';
import { IntelligentProfileAnalysis } from '@/components/onboarding/components/IntelligentProfileAnalysis';
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
  const [activeTab, setActiveTab] = useState('review');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-8 h-8 text-green-400" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Revisão Final & Análise
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Confirme suas informações e veja nossa análise personalizada do seu perfil
        </p>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="bg-neutral-900/50 border border-white/10">
            <TabsTrigger value="review" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dados Coletados
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Análise Inteligente
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Sua Jornada
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Contents */}
        <TabsContent value="review" className="space-y-4">
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <EnhancedOnboardingPreview data={data} />
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <IntelligentProfileAnalysis data={data} />
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card className="p-8 bg-gradient-to-r from-viverblue/10 to-purple-600/10 backdrop-blur-sm border-white/10">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3">
                <Target className="w-6 h-6 text-viverblue" />
                <h3 className="text-xl font-semibold text-white">Sua Jornada Personalizada</h3>
              </div>
              
              <div className="max-w-2xl mx-auto space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  Com base no seu perfil, criamos uma experiência personalizada que inclui:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-neutral-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Brain className="w-5 h-5 text-blue-400" />
                      <h4 className="font-semibold text-white">Conteúdo Direcionado</h4>
                    </div>
                    <p className="text-sm text-neutral-300">
                      Materiais de aprendizado adaptados ao seu nível e objetivos
                    </p>
                  </div>
                  
                  <div className="bg-neutral-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-5 h-5 text-green-400" />
                      <h4 className="font-semibold text-white">Trilha de Implementação</h4>
                    </div>
                    <p className="text-sm text-neutral-300">
                      Plano passo-a-passo para atingir seus objetivos
                    </p>
                  </div>
                  
                  <div className="bg-neutral-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <h4 className="font-semibold text-white">Comunidade Exclusiva</h4>
                    </div>
                    <p className="text-sm text-neutral-300">
                      Networking com executivos do seu setor
                    </p>
                  </div>
                  
                  <div className="bg-neutral-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-yellow-400" />
                      <h4 className="font-semibold text-white">Acompanhamento</h4>
                    </div>
                    <p className="text-sm text-neutral-300">
                      Suporte contínuo na sua jornada de transformação
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={onComplete}
          disabled={isCompleting}
          className="bg-gradient-to-r from-viverblue to-purple-600 hover:from-viverblue/90 hover:to-purple-600/90 text-white px-12 py-4 text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
        >
          {isCompleting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Processando sua jornada...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Iniciar Minha Jornada de IA
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default MockOnboardingStep6;
