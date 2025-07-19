
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const CompleteProfileTabContent = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-high-contrast">Perfil Simplificado</h2>
          <p className="text-medium-contrast text-sm">
            Sistema focado no essencial
          </p>
        </div>
      </div>

      <Alert>
        <AlertDescription>
          O sistema foi simplificado para focar no essencial. Use o dashboard para acessar as funcionalidades principais.
        </AlertDescription>
      </Alert>

      <Card className="glass-dark">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-high-contrast mb-2">
            Sistema Simplificado
          </h3>
          <p className="text-medium-contrast mb-4">
            Acesse diretamente as funcionalidades que você precisa através do dashboard.
          </p>
          <Link to="/dashboard">
            <Button>
              Ir para Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
