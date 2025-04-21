import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Solution } from "@/lib/supabase";
import { CheckCircle, Loader2 } from "lucide-react";
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
      containerRef.current.classList.add("highlight-flash");
      setTimeout(() => {
        containerRef.current?.classList.remove("highlight-flash");
      }, 1200);
    }
  }, [isCompleted]);

  const handleComplete = async () => {
    await onComplete();
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };
  
  if (isCompleted) {
    return (
      <div ref={containerRef} className="text-center py-12 space-y-6 animate-fade-in">
        <div className="bg-green-50 p-6 rounded-lg border border-green-100 mx-auto max-w-xl">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Parabéns!</h2>
          <p className="text-green-700 mb-6">
            Você concluiu com sucesso a implementação da solução "{solution.title}".
            Continue explorando outras soluções para maximizar o potencial do seu negócio.
          </p>
          <Button 
            onClick={() => window.location.href = "/solutions"}
            className="bg-green-600 hover:bg-green-700"
          >
            Explorar mais soluções
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6 space-y-6 animate-fade-in">
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-xl font-semibold text-blue-800 mb-2">Conclusão da Implementação</h3>
        <p className="text-blue-700 mb-4">
          Você completou todos os passos necessários para implementar a solução "{solution.title}"?
        </p>
        <p className="text-blue-600 mb-6">
          Após confirmar a conclusão, esta solução será marcada como implementada no seu perfil e 
          você poderá receber conquistas baseadas neste progresso.
        </p>
        <Button 
          onClick={handleComplete} 
          disabled={isCompleting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isCompleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirmando...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirmar Implementação
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
