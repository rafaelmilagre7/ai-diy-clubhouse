
import React from "react";
import { CertificatesList } from "@/components/learning/certificates/CertificatesList";
import { useAuth } from "@/contexts/auth";

const MemberCertificates = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Meus Certificados</h1>
          <p className="text-muted-foreground mt-1">
            Aqui você encontra todos os certificados obtidos em seus cursos.
          </p>
        </div>
        
        <CertificatesList />
      </div>
    </div>
  );
};

export default MemberCertificates;
