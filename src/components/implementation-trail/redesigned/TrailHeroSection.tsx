
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Target, Zap, Award } from "lucide-react";
import { motion } from "framer-motion";

interface TrailHeroSectionProps {
  hasTrail: boolean;
  onGenerateTrail: () => void;
}

export const TrailHeroSection: React.FC<TrailHeroSectionProps> = ({
  hasTrail,
  onGenerateTrail
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden"
    >
      <Card className="border-0 bg-gradient-to-br from-viverblue/10 via-purple-500/5 to-emerald-400/10 backdrop-blur-xl">
        <CardContent className="p-8 md:p-12">
          <div className="relative z-10">
            {/* Background decorative elements */}
            <div className="absolute inset-0 opacity-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-4 right-4 w-16 h-16 border-2 border-viverblue/30 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-4 left-4 w-8 h-8 bg-emerald-400/20 rounded-full"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left side - Content */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 bg-viverblue/20 rounded-lg">
                    <Sparkles className="h-6 w-6 text-viverblue" />
                  </div>
                  <span className="text-sm font-medium text-viverblue bg-viverblue/10 px-3 py-1 rounded-full">
                    Sua Jornada IA Personalizada
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-viverblue bg-clip-text text-transparent leading-tight"
                >
                  Trilha de Implementação
                  <span className="block text-viverblue">VIVER DE IA</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-gray-300 leading-relaxed"
                >
                  {hasTrail 
                    ? "Soluções e cursos selecionados especialmente para acelerar seu sucesso com IA"
                    : "Gere sua trilha personalizada com as melhores soluções e cursos para seu negócio"
                  }
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {!hasTrail ? (
                    <Button
                      onClick={onGenerateTrail}
                      size="lg"
                      className="bg-gradient-to-r from-viverblue to-emerald-400 hover:from-viverblue/90 hover:to-emerald-400/90 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Zap className="mr-3 h-5 w-5" />
                      Gerar Trilha Personalizada
                    </Button>
                  ) : (
                    <div className="flex items-center gap-3 text-emerald-400">
                      <Award className="h-5 w-5" />
                      <span className="font-medium">Trilha personalizada ativa</span>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Right side - Visual elements */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="hidden md:flex justify-center"
              >
                <div className="relative w-64 h-64">
                  {/* Animated rings */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-viverblue/30 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-8 border-2 border-emerald-400/30 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-16 border-2 border-purple-400/30 rounded-full"
                  />
                  
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-6 bg-gradient-to-br from-viverblue/20 to-emerald-400/20 rounded-full backdrop-blur-sm">
                      <Sparkles className="h-12 w-12 text-viverblue" />
                    </div>
                  </div>

                  {/* Floating elements */}
                  <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute top-4 right-8 p-2 bg-emerald-400/20 rounded-lg backdrop-blur-sm"
                  >
                    <Target className="h-4 w-4 text-emerald-400" />
                  </motion.div>
                  
                  <motion.div
                    animate={{ y: [10, -10, 10] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                    className="absolute bottom-8 left-4 p-2 bg-purple-400/20 rounded-lg backdrop-blur-sm"
                  >
                    <Zap className="h-4 w-4 text-purple-400" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
