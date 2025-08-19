
import React from "react";
import { CertificateEligibility } from "@/components/learning/certificates/CertificateEligibility";
import { UnifiedCertificatesList } from "@/components/learning/certificates/UnifiedCertificatesList";
import { LearningCourse } from "@/lib/supabase/types";

interface CourseCertificateProps {
  course: LearningCourse;
  progressPercentage: number;
}

export const CourseCertificate = ({
  course,
  progressPercentage
}: CourseCertificateProps) => {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold mb-4">Certificado</h2>
        
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
