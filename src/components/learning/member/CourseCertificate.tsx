
import React, { useEffect } from "react";
import { CertificateEligibility } from "@/components/learning/certificates/CertificateEligibility";
import { UnifiedCertificatesList } from "@/components/learning/certificates/UnifiedCertificatesList";

import { LearningCourse } from "@/lib/supabase/types";
import { executeVideoDurationUpdate } from "@/utils/executeVideoDurationUpdate";

interface CourseCertificateProps {
  course: LearningCourse;
  progressPercentage: number;
}

export const CourseCertificate = ({
  course,
  progressPercentage
}: CourseCertificateProps) => {

  // Executar atualização otimizada das durações quando o componente carregar
  useEffect(() => {
    console.log('🎯 Componente de certificado carregado - verificando durações...');
    
    // Execução discreta em background sem bloquear a UI
    setTimeout(() => {
      executeVideoDurationUpdate().catch(console.error);
    }, 1000);
  }, [course.id]);

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Certificado</h2>
        </div>
        
        <CertificateEligibility 
          courseId={course.id} 
          progressPercentage={progressPercentage} 
        />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Certificados deste curso</h3>
        <UnifiedCertificatesList courseId={course.id} />
      </div>
    </div>
  );
};
