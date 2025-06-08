
import React from "react";
import { CertificatesList } from "@/components/learning/certificates/CertificatesList";
import { useAuth } from "@/contexts/auth";

const MemberCertificates = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Meus Certificados</h1>
          <p className="text-gray-300 mt-1">
            Aqui você encontra todos os certificados obtidos em seus cursos e implementações de soluções.
          </p>
        </div>
        
        {/* Lista de certificados */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Seus Certificados</h2>
          <CertificatesList />
        </div>
      </div>
    </div>
  );
};

export default MemberCertificates;
