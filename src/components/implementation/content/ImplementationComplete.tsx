
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Solution } from "@/lib/supabase";
import { CheckCircle, Loader2, Award, Share2, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

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
      }, 1200);
    }
  }, [isCompleted]);

  const handleComplete = async () => {
    await onComplete();
  };
  
  if (isCompleted) {
    return (
      <div ref={containerRef} className="text-center py-8 space-y-6 animate-fade-in">
        <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl border border-green-100 shadow-md mx-auto max-w-xl">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30"></div>
            <div className="relative flex items-center justify-center bg-green-100 w-20 h-20 rounded-full">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-green-800 mb-3">Parabéns!</h2>
          <p className="text-green-700 mb-6 text-lg">
            Você concluiu com sucesso a implementação da solução <span className="font-semibold">"{solution.title}"</span>.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center border border-green-50 hover:border-green-200 transition-all item-pop">
              <div className="text-3xl font-bold text-[#0ABAB5]">1</div>
              <div className="text-sm text-muted-foreground">Solução Implementada</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center border border-green-50 hover:border-green-200 transition-all item-pop" style={{animationDelay: "0.1s"}}>
              <div className="text-3xl font-bold text-[#0ABAB5]">8</div>
              <div className="text-sm text-muted-foreground">Módulos Concluídos</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center border border-green-50 hover:border-green-200 transition-all item-pop" style={{animationDelay: "0.2s"}}>
              <div className="text-3xl font-bold text-[#0ABAB5]">+30%</div>
              <div className="text-sm text-muted-foreground">Eficiência Esperada</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Button 
              onClick={() => window.location.href = "/solutions"}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              <Award className="h-4 w-4" />
              Ver conquista
            </Button>
            
            <Button 
              onClick={() => window.location.href = "/dashboard"}
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50 gap-2"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6 space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 shadow-sm">
        <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <Award className="h-5 w-5 text-[#0ABAB5]" />
          Conclusão da Implementação
        </h3>
        
        <p className="text-blue-700 mb-4">
          Você completou todos os passos necessários para implementar a solução <span className="font-medium">"{solution.title}"</span>?
        </p>
        
        <div className="bg-white rounded-lg p-4 border border-blue-50 mb-6">
          <p className="text-blue-600 mb-2 text-sm">
            <span className="font-medium">Ao confirmar, você:</span>
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Receberá uma conquista no seu perfil</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Terá acesso a materiais exclusivos de otimização</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Poderá compartilhar seu sucesso com outros membros</span>
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleComplete} 
            disabled={isCompleting}
            className="bg-[#0ABAB5] hover:bg-[#089891] transition-colors gap-2"
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
            className="border-[#0ABAB5]/20 text-[#0ABAB5] hover:bg-[#0ABAB5]/5"
          >
            Voltar depois
          </Button>
        </div>
      </div>
      
      {/* Seção de próximos passos */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-[#0ABAB5]" />
          Próximos passos
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="bg-amber-100 p-2 rounded-full mr-1 flex-shrink-0">
              <Share2 className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Compartilhe seus resultados</h4>
              <p className="text-xs text-muted-foreground">
                Inspire outros membros compartilhando sua experiência de implementação
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="bg-blue-100 p-2 rounded-full mr-1 flex-shrink-0">
              <Award className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Explore mais soluções</h4>
              <p className="text-xs text-muted-foreground">
                Continue sua transformação descobrindo novas soluções para o seu negócio
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
