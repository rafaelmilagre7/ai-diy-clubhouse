
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-neutral-700 mb-4">404</div>
        <h1 className="text-2xl font-bold text-neutral-100 mb-2">
          Página não encontrada
        </h1>
        <p className="text-neutral-400 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 bg-viverblue hover:bg-viverblue/90"
          >
            <Home className="h-4 w-4" />
            Ir para Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
