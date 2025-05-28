
import React, { useState } from "react";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { usePremiumTrailExperience } from "@/hooks/implementation/usePremiumTrailExperience";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Sparkles, ArrowRight, Wand2 } from "lucide-react";
import { PremiumTrailExperience } from "./PremiumTrailExperience";
import { TrailMagicExperience } from "../onboarding/TrailMagicExperience";
import { motion, AnimatePresence } from "framer-motion";

export const ImplementationTrailCreator: React.FC = () => {
  const { 
    trail, 
    isLoading, 
    regenerating, 
    refreshing, 
    error, 
    hasContent, 
    generateImplementationTrail,
    refreshTrail 
  } = useImplementationTrail();

  const { enhanceTrailWithAI, enhancing } = usePremiumTrailExperience();
  const [showMagicExperience, setShowMagicExperience] = useState(false);
  const [showPremiumExperience, setShowPremiumExperience] = useState(false);

  console.log('ImplementationTrailCreator state:', {
    trail,
    isLoading,
    regenerating,
    refreshing,
    error,
    hasContent,
    showPremiumExperience
  });

  // Estado de carregamento
  if (isLoading || regenerating || refreshing || enhancing) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[400px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-viverblue/30 border-t-viverblue rounded-full mb-6"
          />
          <h3 className="text-xl font-semibold text-white mb-2">
            {regenerating ? "Gerando sua trilha personalizada..." : 
             enhancing ? "Aprimorando com IA..." :
             "Carregando trilha..."}
          </h3>
          <p className="text-neutral-400 text-center max-w-md">
            {regenerating 
              ? "Estamos analisando seu perfil e criando recomendações personalizadas para seu negócio."
              : enhancing
                ? "Nossa IA está personalizando as justificativas e recomendações especialmente para você."
                : "Aguarde enquanto carregamos sua trilha de implementação."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  // Magic Experience
  if (showMagicExperience) {
    return (
      <TrailMagicExperience 
        onFinish={() => {
          setShowMagicExperience(false);
          setShowPremiumExperience(true);
        }} 
      />
    );
  }

  // Premium Experience
  if (showPremiumExperience && hasContent && trail) {
    return (
      <PremiumTrailExperience 
        trail={trail}
        onEnhance={async () => {
          setShowPremiumExperience(false);
          const enhanced = await enhanceTrailWithAI(trail);
          if (enhanced) {
            await refreshTrail(true);
            setShowPremiumExperience(true);
          }
        }}
      />
    );
  }

  // Estado de erro
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-400">Erro ao Carregar Trilha</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-300 mb-4">{error}</p>
          <div className="flex gap-4">
            <Button 
              onClick={() => generateImplementationTrail()}
              className="bg-viverblue hover:bg-viverblue/90"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Gerar Trilha
            </Button>
            <Button 
              onClick={() => refreshTrail()}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recarregar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado com trilha existente
  if (hasContent && trail) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-viverblue" />
            Sua Trilha de Implementação
          </CardTitle>
          <p className="text-neutral-400">
            Trilha personalizada com base no seu perfil e objetivos de negócio
          </p>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => setShowPremiumExperience(true)}
                  className="bg-gradient-to-r from-viverblue to-emerald-500 hover:opacity-90 text-white h-auto py-4"
                  size="lg"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Experiência Premium</div>
                    <div className="text-sm opacity-90">Trilha guiada personalizada</div>
                  </div>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <Button 
                  onClick={async () => {
                    const enhanced = await enhanceTrailWithAI(trail);
                    if (enhanced) {
                      await refreshTrail(true);
                      setShowPremiumExperience(true);
                    }
                  }}
                  variant="outline"
                  className="border-viverblue text-viverblue hover:bg-viverblue/10 h-auto py-4"
                  size="lg"
                >
                  <Wand2 className="mr-2 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Personalizar com IA</div>
                    <div className="text-sm opacity-75">Justificativas inteligentes</div>
                  </div>
                </Button>
              </div>

              {/* Quick Preview */}
              <div className="bg-gradient-to-r from-viverblue/5 to-emerald-500/5 rounded-lg p-6 border border-viverblue/20">
                <h4 className="text-lg font-semibold text-white mb-2">Sua trilha contém:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{trail.priority1?.length || 0}</div>
                    <div className="text-neutral-400">Alta Prioridade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">{trail.priority2?.length || 0}</div>
                    <div className="text-neutral-400">Prioridade Média</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-viverblue">{trail.recommended_lessons?.length || 0}</div>
                    <div className="text-neutral-400">Aulas Recomendadas</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          <div className="mt-6 text-center">
            <Button 
              onClick={() => {
                setShowMagicExperience(true);
                generateImplementationTrail();
              }}
              variant="outline"
              className="border-viverblue text-viverblue hover:bg-viverblue/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerar Trilha
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado inicial - sem trilha
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-viverblue" />
          Gerar Trilha de Implementação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="mb-6">
            <motion.div 
              className="w-20 h-20 bg-gradient-to-r from-viverblue/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles className="h-10 w-10 text-viverblue" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Crie sua trilha personalizada
            </h3>
            <p className="text-neutral-400 max-w-md mx-auto">
              Com base no seu perfil e objetivos, vamos criar uma trilha de implementação de IA 
              personalizada para acelerar o crescimento do seu negócio.
            </p>
          </div>
          
          <Button 
            onClick={() => {
              setShowMagicExperience(true);
              generateImplementationTrail();
            }}
            className="bg-gradient-to-r from-viverblue to-emerald-500 hover:opacity-90 text-white px-8 py-3 text-lg"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Gerar Minha Trilha
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
};
