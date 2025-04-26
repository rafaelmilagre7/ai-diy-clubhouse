
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, BookOpen, PenLine } from "lucide-react";
import { motion } from 'framer-motion';

interface OnboardingCompletedProps {
  onReview: () => void;
}

export const OnboardingCompleted: React.FC<OnboardingCompletedProps> = ({
  onReview
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="container max-w-4xl mx-auto py-16 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-gray-800 border-gray-700 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-[#0ABAB5]" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">Onboarding Concluído!</CardTitle>
          <CardDescription className="text-xl text-gray-300">
            Todas as suas informações estão salvas e sua trilha personalizada está pronta
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="bg-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-3">E agora?</h2>
            <p className="text-gray-300 mb-4">
              Com base nas suas respostas, criamos uma trilha personalizada para implementação
              de IA no seu negócio. Você também pode revisar ou alterar suas respostas a 
              qualquer momento.
            </p>
            
            <div className="grid gap-4 mt-8 md:grid-cols-2">
              <Button 
                onClick={() => navigate("/implementation-trail")}
                className="flex items-center justify-center gap-2 h-auto px-6 py-4 bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
              >
                <BookOpen className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium text-base">Ir para Minha Trilha</div>
                  <div className="text-sm opacity-80">Veja soluções personalizadas</div>
                </div>
              </Button>

              <Button 
                onClick={onReview}
                variant="outline"
                className="flex items-center justify-center gap-2 h-auto px-6 py-4 bg-transparent border-gray-500 hover:bg-gray-700"
              >
                <PenLine className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium text-base">Revisar Respostas</div>
                  <div className="text-sm opacity-80">Editar informações anteriores</div>
                </div>
              </Button>
            </div>
          </div>

          <div className="text-center text-gray-400 text-sm pt-2">
            Entre em contato com o suporte caso precise de ajuda adicional
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
