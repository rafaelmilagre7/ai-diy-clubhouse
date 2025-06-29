
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const AuthError: React.FC = () => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro de autenticação</AlertTitle>
      <AlertDescription>
        Você precisa estar autenticado para editar soluções. Por favor, faça login novamente.
      </AlertDescription>
    </Alert>
  );
};

export default AuthError;
