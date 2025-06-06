
import React from "react";
import { SmartFeatureGuard } from "@/components/auth/SmartFeatureGuard";
import { ImplementationTrailCreator } from "@/components/implementation-trail/ImplementationTrailCreator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageTransition } from "@/components/transitions/PageTransition";
import { FadeTransition } from "@/components/transitions/FadeTransition";

const ImplementationTrailPage = () => {
  return (
    <PageTransition>
      <div className="container py-8">
        <SmartFeatureGuard feature="implementation_trail">
          <Card>
            <CardHeader>
              <CardTitle>Trilha de Implementação Personalizada</CardTitle>
              <CardDescription>
                Sua jornada de IA personalizada com soluções e cursos selecionados para acelerar seu sucesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FadeTransition>
                <ImplementationTrailCreator />
              </FadeTransition>
            </CardContent>
          </Card>
        </SmartFeatureGuard>
      </div>
    </PageTransition>
  );
};

export default ImplementationTrailPage;
