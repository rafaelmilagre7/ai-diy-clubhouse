
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Award, Share2, ArrowRight } from "lucide-react";
import { Module } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import confetti from 'canvas-confetti';

interface CelebrationModuleProps {
  module: Module;
  onComplete: () => void;
}

export const CelebrationModule = ({ module, onComplete }: CelebrationModuleProps) => {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    // Dispara confetti ao carregar o componente
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    
    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };
    
    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      
      const particleCount = 50 * (timeLeft / duration);
      
      // Dispara confetti dos cantos
      confetti({
        particleCount: Math.floor(randomInRange(30, 60)),
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: 0, y: 0.8 }
      });
      
      confetti({
        particleCount: Math.floor(randomInRange(30, 60)),
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: 1, y: 0.8 }
      });
    }, 250);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">
          Parabéns! Implementação Concluída
        </h1>
        <p className="text-xl text-muted-foreground">
          Você concluiu com sucesso a implementação desta solução
        </p>
      </div>
      
      <div className="bg-green-50 p-6 rounded-lg border border-green-100">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Award className="mr-2 h-6 w-6 text-aurora-primary" />
          Suas conquistas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-aurora-primary">1</div>
            <div className="text-sm text-muted-foreground">Solução Implementada</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-aurora-primary">8</div>
            <div className="text-sm text-muted-foreground">Módulos Concluídos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-aurora-primary">+30%</div>
            <div className="text-sm text-muted-foreground">Eficiência Esperada</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Próximos passos</h2>
        <ul className="space-y-4">
          <li className="flex items-start">
            <div className="bg-amber-100 p-2 rounded-full mr-3 flex-shrink-0">
              <Share2 className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-medium">Compartilhe seus resultados</h3>
              <p className="text-sm text-muted-foreground">
                Compartilhe seus resultados com o time do VIVER DE IA e com outros membros
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3 flex-shrink-0">
              <ArrowRight className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-medium">Explore mais soluções</h3>
              <p className="text-sm text-muted-foreground">
                Retorne ao dashboard e explore outras soluções para continuar otimizando seu negócio
              </p>
            </div>
          </li>
        </ul>
      </div>
      
      <div className="flex justify-center space-x-4 pt-8">
        <Button 
          onClick={onComplete} 
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          Finalizar
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate("/dashboard")}
        >
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
};
