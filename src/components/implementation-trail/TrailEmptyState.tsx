
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, ArrowRight, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface TrailEmptyStateProps {
  onRegenerate: () => void;
}

export const TrailEmptyState: React.FC<TrailEmptyStateProps> = ({
  onRegenerate
}) => {
  return (
    <div className="text-center py-12 space-y-8">
      {/* Ícone animado */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="flex justify-center"
      >
        <div className="relative">
          <div className="bg-viverblue/10 p-6 rounded-full">
            <Sparkles className="h-16 w-16 text-viverblue" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2"
          >
            <div className="bg-viverblue p-2 rounded-full">
              <Target className="h-6 w-6 text-white" />
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Conteúdo principal */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white">
          Vamos criar sua trilha personalizada!
        </h3>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Nossa IA analisará seu perfil e objetivos para criar uma trilha de implementação 
          totalmente personalizada com as melhores soluções para seu negócio.
        </p>
      </div>

      {/* Cards de benefícios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card className="bg-gray-800/30 border-gray-700/50">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-viverblue mx-auto mb-2" />
            <h4 className="font-semibold text-white mb-1">Personalizada</h4>
            <p className="text-sm text-gray-400">
              Baseada no seu perfil e objetivos específicos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700/50">
          <CardContent className="p-4 text-center">
            <Sparkles className="h-8 w-8 text-viverblue mx-auto mb-2" />
            <h4 className="font-semibold text-white mb-1">IA Avançada</h4>
            <p className="text-sm text-gray-400">
              Algoritmos inteligentes para as melhores recomendações
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700/50">
          <CardContent className="p-4 text-center">
            <Lightbulb className="h-8 w-8 text-viverblue mx-auto mb-2" />
            <h4 className="font-semibold text-white mb-1">Resultados</h4>
            <p className="text-sm text-gray-400">
              Foco em implementação prática e resultados reais
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Botão de ação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          onClick={onRegenerate}
          className="bg-viverblue hover:bg-viverblue/90 text-white px-8 py-4 text-lg font-medium rounded-lg flex items-center gap-3 mx-auto"
          size="lg"
        >
          <Sparkles className="h-5 w-5" />
          Gerar Trilha Personalizada
          <ArrowRight className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Informação adicional */}
      <div className="text-sm text-gray-500 space-y-2">
        <p>⚡ Geração em tempo real com IA</p>
        <p>🎯 Baseada nos seus dados de onboarding</p>
        <p>🚀 Pronta para implementação imediata</p>
      </div>
    </div>
  );
};
