
import React from "react";
import { ImplementationTrailCreator } from "@/components/implementation-trail/ImplementationTrailCreator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageTransition } from "@/components/transitions/PageTransition";
import { FadeTransition } from "@/components/transitions/FadeTransition";

const ImplementationTrailPage = () => {
  return (
    <PageTransition>
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Trilha de Implementação Personalizada</CardTitle>
            <CardDescription>
              Sua jornada de IA personalizada com base no seu perfil de onboarding e objetivos de negócio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FadeTransition>
              <ImplementationTrailCreator />
            </FadeTransition>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default ImplementationTrailPage;
