
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Solution } from "@/lib/supabase";
import { CheckCircle, Loader2, Award, Share2, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { FadeTransition } from "@/components/transitions/FadeTransition";

interface ImplementationCompleteProps {
  solution: Solution;
  onComplete: () => Promise<void>;
  isCompleting: boolean;
  isCompleted?: boolean;
}

export const ImplementationComplete: React.FC<ImplementationCompleteProps> = ({
  solution,
  onComplete,
  isCompleting,
  isCompleted = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (isCompleted && containerRef.current) {
      // Adiciona efeito de destaque
      containerRef.current.classList.add("highlight-flash");
      
      // Dispara confetes ao concluir
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Remove classe após animação
      setTimeout(() => {
        containerRef.current?.classList.remove("highlight-flash");
        // Marca que a animação inicial está completa
        setAnimationComplete(true);
      }, 1200);
    }
  }, [isCompleted]);

  const handleComplete = async () => {
    try {
      // Primeira explosão de confetes ao clicar
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0ABAB5', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1']
      });
      
      await onComplete();
      
      // Segunda explosão de confetes após completar
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#0ABAB5', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1']
        });
        
        // Confetes laterais
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 300);
      }, 500);
      
    } catch (error) {
      console.error('Erro ao concluir implementação:', error);
    }
  };
  
  if (isCompleted) {
    return (
      <div ref={containerRef} className="text-center py-8 space-y-6 animate-fade-in">
        <div className="relative bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-2xl mx-auto max-w-xl group hover:bg-white/10 transition-all duration-500">
          {/* Subtle dots pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none rounded-xl">
            <div className="absolute inset-0 rounded-xl" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
              backgroundSize: '20px 20px'
            }} />
          </div>
          
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="relative w-20 h-20 mx-auto mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full animate-ping opacity-30"></div>
            <div className="relative flex items-center justify-center bg-gradient-to-r from-purple-500/20 to-blue-500/20 w-20 h-20 rounded-full border border-purple-500/30">
              <CheckCircle className="h-10 w-10 text-purple-400" />
            </div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-3"
          >
            Parabéns!
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-neutral-200 mb-6 text-lg"
          >
            Você concluiu com sucesso a implementação da solução <span className="font-semibold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">"{solution.title}"</span>.
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            {[
              { value: "1", label: "Solução Implementada", delay: 0.5 },
              { value: "8", label: "Módulos Concluídos", delay: 0.6 },
              { value: "+30%", label: "Eficiência Esperada", delay: 0.7 }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.delay }}
                className="bg-white/5 backdrop-blur-sm p-4 rounded-lg shadow-sm text-center border border-white/10 hover:border-purple-500/30 hover:bg-white/10 transition-all duration-300"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: stat.delay + 0.1, type: "spring", stiffness: 300 }}
                  className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-neutral-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button 
                onClick={() => window.location.href = "/solutions"}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 gap-2"
              >
                <Award className="h-4 w-4" />
                Ver conquista
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Button 
                onClick={() => window.location.href = "/dashboard"}
                variant="outline"
                className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 gap-2"
              >
                Voltar ao Dashboard
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <FadeTransition className="py-6 space-y-6">
      <div className="relative bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-2xl group hover:bg-white/10 transition-all duration-500">
        {/* Subtle dots pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none rounded-xl">
          <div className="absolute inset-0 rounded-xl" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }} />
        </div>
        
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
        
        <h3 className="relative text-xl font-semibold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-3 flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-400" />
          Conclusão da Implementação
        </h3>
        
        <p className="text-neutral-200 mb-4">
          Você completou todos os passos necessários para implementar a solução <span className="font-medium bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">"{solution.title}"</span>?
        </p>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 mb-6">
          <p className="text-neutral-300 mb-2 text-sm">
            <span className="font-medium">Ao confirmar, você:</span>
          </p>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-400 flex-shrink-0" />
              <span>Receberá uma conquista no seu perfil</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-400 flex-shrink-0" />
              <span>Terá acesso a materiais exclusivos de otimização</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-400 flex-shrink-0" />
              <span>Poderá compartilhar seu sucesso com outros membros</span>
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleComplete} 
            disabled={isCompleting}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 gap-2"
          >
            {isCompleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Confirmar Implementação
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/dashboard"}
            className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300"
          >
            Voltar depois
          </Button>
        </div>
      </div>
      
      {/* Seção de próximos passos */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-2xl group hover:bg-white/10 transition-all duration-500"
      >
        {/* Subtle dots pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none rounded-xl">
          <div className="absolute inset-0 rounded-xl" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }} />
        </div>
        
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
        
        <h3 className="relative text-lg font-medium mb-4 flex items-center gap-2 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
          <ArrowRight className="h-5 w-5 text-purple-400" />
          Próximos passos
        </h3>
        
        <div className="relative space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-2 rounded-full mr-1 flex-shrink-0 border border-purple-500/30">
              <Share2 className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-neutral-200">Compartilhe seus resultados</h4>
              <p className="text-xs text-neutral-400">
                Inspire outros membros compartilhando sua experiência de implementação
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-2 rounded-full mr-1 flex-shrink-0 border border-purple-500/30">
              <Award className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-neutral-200">Explore mais soluções</h4>
              <p className="text-xs text-neutral-400">
                Continue sua transformação descobrindo novas soluções para o seu negócio
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </FadeTransition>
  );
};
