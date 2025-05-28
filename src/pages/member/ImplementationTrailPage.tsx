
import React from "react";
import { OnboardingValidator } from "@/components/onboarding/OnboardingValidator";
import { ImplementationTrailCreator } from "@/components/implementation-trail/ImplementationTrailCreator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageTransition } from "@/components/transitions/PageTransition";
import { FadeTransition } from "@/components/transitions/FadeTransition";

const ImplementationTrailPage = () => {
  return (
    <PageTransition>
      <div className="container py-8">
        <OnboardingValidator requireOnboarding={true} redirectTo="/onboarding-new">
          <Card>
            <CardHeader>
              <CardTitle>Trilha de Implementação</CardTitle>
              <CardDescription>
                Sua trilha personalizada com base no seu perfil e objetivos de negócio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FadeTransition>
                <ImplementationTrailCreator />
              </FadeTransition>
            </CardContent>
          </Card>
        </OnboardingValidator>
      </div>
    </PageTransition>
  );
};

export default ImplementationTrailPage;
