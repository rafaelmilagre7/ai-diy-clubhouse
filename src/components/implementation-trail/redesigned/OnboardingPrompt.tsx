
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  ArrowRight, 
  Target, 
  Brain, 
  Zap, 
  CheckCircle,
  User,
  Building,
  Lightbulb
} from "lucide-react";
import { motion } from "framer-motion";

interface OnboardingPromptProps {
  onStartOnboarding: () => void;
  onViewPreview?: () => void;
}

export const OnboardingPrompt: React.FC<OnboardingPromptProps> = ({
  onStartOnboarding,
  onViewPreview
}) => {
  const benefits = [
    {
      icon: Target,
      title: "Soluções Personalizadas",
      description: "Receba recomendações específicas para seu setor e objetivos"
    },
    {
      icon: Brain,
      title: "IA Inteligente",
      description: "Nossa IA analisa seu perfil para sugerir a melhor trilha"
    },
    {
      icon: Zap,
      title: "Implementação Rápida",
      description: "Comece a implementar IA no seu negócio em poucos dias"
    }
  ];

  const steps = [
    {
      icon: User,
      title: "Perfil Pessoal",
      description: "Conte-nos sobre você e sua experiência"
    },
    {
      icon: Building,
      title: "Contexto do Negócio",
      description: "Compartilhe detalhes sobre sua empresa"
    },
    {
      icon: Lightbulb,
      title: "Objetivos e Metas",
      description: "Defina onde quer chegar com IA"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Main prompt card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-0 bg-gradient-to-br from-viverblue/10 via-purple-500/5 to-emerald-400/10 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-8 md:p-12 relative">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute top-8 right-8 w-24 h-24 border border-viverblue rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-8 left-8 w-16 h-16 bg-emerald-400/20 rounded-full"
              />
            </div>

            <div className="relative z-10 text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex p-4 bg-viverblue/20 rounded-2xl"
              >
                <Sparkles className="h-12 w-12 text-viverblue" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <Badge className="bg-viverblue/20 text-viverblue border-viverblue/30 px-4 py-2">
                  Personalização Completa
                </Badge>
                
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-viverblue bg-clip-text text-transparent">
                  Complete seu Onboarding
                </h2>
                
                <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  Para criar uma trilha verdadeiramente personalizada, precisamos conhecer melhor 
                  você e seu negócio. Este processo leva apenas 5 minutos e fará toda a diferença 
                  nos seus resultados.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  onClick={onStartOnboarding}
                  size="lg"
                  className="bg-gradient-to-r from-viverblue to-emerald-400 hover:from-viverblue/90 hover:to-emerald-400/90 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <User className="mr-3 h-5 w-5" />
                  Iniciar Onboarding
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
                
                {onViewPreview && (
                  <Button
                    onClick={onViewPreview}
                    variant="outline"
                    size="lg"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 px-6 py-6"
                  >
                    Ver Exemplo de Trilha
                  </Button>
                )}
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Benefits section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <Card className="border-gray-800 bg-gray-900/30 backdrop-blur-sm h-full">
              <CardContent className="p-6 text-center space-y-4">
                <div className="inline-flex p-3 bg-viverblue/20 rounded-xl">
                  <benefit.icon className="h-6 w-6 text-viverblue" />
                </div>
                <h3 className="font-semibold text-white">{benefit.title}</h3>
                <p className="text-sm text-gray-300">{benefit.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Process steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border-gray-800 bg-gray-900/30 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-white mb-2">
                Como funciona o onboarding?
              </h3>
              <p className="text-gray-300">
                Apenas 3 etapas simples para personalizar sua experiência
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((step, index) => (
                <div key={step.title} className="text-center space-y-3">
                  <div className="relative">
                    <div className="inline-flex p-4 bg-gradient-to-br from-viverblue/20 to-emerald-400/10 rounded-xl">
                      <step.icon className="h-6 w-6 text-viverblue" />
                    </div>
                    <Badge className="absolute -top-2 -right-2 bg-viverblue text-white w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-white">{step.title}</h4>
                  <p className="text-sm text-gray-400">{step.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
