
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCertificates } from "@/hooks/learning/useCertificates";
import { Award, Loader2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface CertificateEligibilityProps {
  courseId: string;
  progressPercentage?: number;
}

export const CertificateEligibility = ({
  courseId,
  progressPercentage = 0,
}: CertificateEligibilityProps) => {
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [hasCertificate, setHasCertificate] = useState(false);
  
  const {
    certificates,
    isLoading,
    error,
    checkEligibility,
    generateCertificate,
    isGenerating,
  } = useCertificates(courseId);
  
  useEffect(() => {
    setHasCertificate(certificates.length > 0);
  }, [certificates]);
  
  const handleCheckEligibility = async () => {
    setIsChecking(true);
    try {
      const eligible = await checkEligibility(courseId);
      setIsEligible(eligible);
    } catch (error) {
      console.error("Erro ao verificar elegibilidade:", error);
      setIsEligible(false);
    } finally {
      setIsChecking(false);
    }
  };
  
  useEffect(() => {
    if (courseId && !hasCertificate) {
      handleCheckEligibility();
    }
  }, [courseId, hasCertificate]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (hasCertificate) {
    return (
      <Alert className="bg-primary/10 border-primary/20">
        <Award className="h-4 w-4 text-primary" />
        <AlertTitle>Parabéns!</AlertTitle>
        <AlertDescription>
          Você já possui o certificado deste curso.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Progresso do curso</h3>
        <div className="flex flex-col gap-1.5">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progressPercentage}% concluído</span>
            <span>{isEligible === true ? "Elegível para certificado" : "100% necessário para certificado"}</span>
          </div>
        </div>
      </div>

      {isEligible === true && (
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => generateCertificate(courseId)}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando certificado...
              </>
            ) : (
              <>
                <Award className="mr-2 h-4 w-4" />
                Gerar certificado
              </>
            )}
          </Button>
        </div>
      )}

      {isEligible === false && (
        <Alert variant="warning" className="mt-2">
          <AlertTitle>Não elegível para certificado</AlertTitle>
          <AlertDescription>
            Complete todas as aulas do curso para se tornar elegível para receber o certificado.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
