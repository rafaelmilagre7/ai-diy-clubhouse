
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
          <h2 className="text-xl font-semibold text-high-contrast">Perfil Completo</h2>
          <p className="text-medium-contrast text-sm">
            Dados detalhados do onboarding estarão disponíveis em breve
          </p>
        </div>
        <Link to="/admin/onboarding-preview">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Ver Preview do Onboarding
          </Button>
        </Link>
      </div>

      <Alert>
        <AlertDescription>
          O sistema de onboarding completo está sendo desenvolvido. Por enquanto, você pode testar a experiência no preview administrativo.
        </AlertDescription>
      </Alert>

      <Card className="glass-dark">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-high-contrast mb-2">
            Em Desenvolvimento
          </h3>
          <p className="text-medium-contrast mb-4">
            Esta seção mostrará as informações completas do seu perfil baseadas no onboarding.
          </p>
          <Link to="/admin/onboarding-preview">
            <Button>
              Acessar Preview do Onboarding
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
