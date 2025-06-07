
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSolutionCertificates } from "@/hooks/learning/useSolutionCertificates";
import { Award, Loader2, CheckCircle2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface SolutionCertificateEligibilityProps {
  solutionId: string;
  isCompleted?: boolean;
}

export const SolutionCertificateEligibility = ({
  solutionId,
  isCompleted = false,
}: SolutionCertificateEligibilityProps) => {
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  const {
    certificates,
    isLoading,
    checkEligibility,
    generateCertificate,
    isGenerating,
  } = useSolutionCertificates(solutionId);
  
  const hasCertificate = certificates.length > 0;
  
  useEffect(() => {
    const handleCheckEligibility = async () => {
      if (!solutionId || hasCertificate) return;
      
      setIsChecking(true);
      try {
        const eligible = await checkEligibility(solutionId);
        setIsEligible(eligible);
      } catch (error) {
        console.error("Erro ao verificar elegibilidade:", error);
        setIsEligible(false);
      } finally {
        setIsChecking(false);
      }
    };

    handleCheckEligibility();
  }, [solutionId, hasCertificate, checkEligibility]);
  
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (hasCertificate) {
    return (
      <Alert className="bg-viverblue/10 border-viverblue/20">
        <Award className="h-4 w-4 text-viverblue" />
        <AlertTitle className="text-viverblue">Parabéns!</AlertTitle>
        <AlertDescription className="text-gray-300">
          Você já possui o certificado de implementação desta solução.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isCompleted) {
    return (
      <Alert className="bg-amber-900/20 border-amber-700">
        <AlertTitle className="text-amber-300">Implementação em Progresso</AlertTitle>
        <AlertDescription className="text-amber-200">
          Complete a implementação desta solução para se tornar elegível ao certificado.
        </AlertDescription>
      </Alert>
    );
  }

  if (isEligible === true) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-[#151823] border-viverblue/20">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold text-white">Elegível para Certificado</h3>
        </div>
        
        <p className="text-gray-300">
          Parabéns! Você completou com sucesso a implementação desta solução e está elegível para receber seu certificado.
        </p>
        
        <Button
          onClick={() => generateCertificate(solutionId)}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-viverblue to-viverblue-light hover:from-viverblue/90 hover:to-viverblue-light/90 text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando certificado...
            </>
          ) : (
            <>
              <Award className="mr-2 h-4 w-4" />
              Gerar Certificado
            </>
          )}
        </Button>
      </div>
    );
  }

  if (isEligible === false) {
    return (
      <Alert variant="destructive" className="bg-red-900/20 border-red-700">
        <AlertTitle className="text-red-300">Não Elegível</AlertTitle>
        <AlertDescription className="text-red-200">
          Complete todos os módulos da implementação para se tornar elegível ao certificado.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
