
import React from "react";
import { CertificatesList } from "@/components/learning/certificates/CertificatesList";
import { Helmet } from "react-helmet-async";

const MyCertificates = () => {  
  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>Meus Certificados | Plataforma de Aprendizagem</title>
      </Helmet>
      
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

export default MyCertificates;
