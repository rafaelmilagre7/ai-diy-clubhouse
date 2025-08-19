
import React from "react";
import { Award } from "lucide-react";

export const CertificatesHeader = () => {
  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center space-x-2">
        <Award className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Certificados</h1>
      </div>
      <p className="text-muted-foreground">
        Visualize e gerencie seus certificados de conclusão das soluções implementadas
      </p>
    </div>
  );
};
