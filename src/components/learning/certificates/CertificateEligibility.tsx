
import React from "react";
import { Button } from "@/components/ui/button";
import { useCertificateEligibility } from "@/hooks/learning/useCertificateEligibility";
import { Award, Loader2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface CertificateEligibilityProps {
  courseId: string;
  progressPercentage: number;
}

export const CertificateEligibility = ({
  courseId,
  progressPercentage = 0,
}: CertificateEligibilityProps) => {
  const {
    isEligible,
    isCheckingEligibility,
    generateCertificate,
    isGenerating,
  } = useCertificateEligibility(courseId);

  if (isCheckingEligibility) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
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
            <span>{isEligible ? "Elegível para certificado" : "100% necessário para certificado"}</span>
          </div>
        </div>
      </div>

      {isEligible && (
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => generateCertificate()}
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

      {!isEligible && progressPercentage < 100 && (
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
