
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUnifiedCertificates } from "@/hooks/learning/useUnifiedCertificates";
import { Award, Loader2, CheckCircle2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface CertificateEligibilityProps {
  courseId: string;
  progressPercentage: number;
}

export const CertificateEligibility = ({
  courseId,
  progressPercentage,
}: CertificateEligibilityProps) => {
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  const {
    certificates,
    isLoading,
    generatePendingCertificates,
    isGeneratingPending,
  } = useUnifiedCertificates(courseId);
  
  const hasCertificate = certificates.length > 0;
  const isCompleted = progressPercentage >= 100;
  
  useEffect(() => {
    // Auto-detecção baseada no progresso
    if (isCompleted && !hasCertificate) {
      setIsEligible(true);
    } else {
      setIsEligible(false);
    }
  }, [courseId, hasCertificate, isCompleted]);
  
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
          Você já possui o certificado de conclusão deste curso.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isCompleted) {
    return (
      <Alert className="bg-amber-900/20 border-amber-700">
        <AlertTitle className="text-amber-300">Curso em Progresso</AlertTitle>
        <AlertDescription className="text-amber-200">
          Complete todas as aulas do curso para se tornar elegível ao certificado. Progresso atual: {progressPercentage}%
        </AlertDescription>
      </Alert>
    );
  }

  if (isEligible === true) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-card border-aurora-primary/20">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold text-white">Elegível para Certificado</h3>
        </div>
        
        <p className="text-gray-300">
          Parabéns! Você completou com sucesso este curso e está elegível para receber seu certificado.
        </p>
        
        <Button
          onClick={() => generatePendingCertificates()}
          disabled={isGeneratingPending}
          className="w-full bg-gradient-to-r from-viverblue to-viverblue-light hover:from-viverblue/90 hover:to-viverblue-light/90 text-white"
        >
          {isGeneratingPending ? (
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
          Complete todas as aulas do curso para se tornar elegível ao certificado.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
