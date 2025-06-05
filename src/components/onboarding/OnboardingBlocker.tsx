
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OnboardingBlockerProps {
  feature: string;
  description: string;
  buttonText?: string;
  redirectTo?: string;
}

export const OnboardingBlocker: React.FC<OnboardingBlockerProps> = ({
  feature,
  description,
  buttonText = "Completar Onboarding",
  redirectTo = "/onboarding"
}) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="w-full max-w-md mx-auto border-amber-200/20 bg-amber-50/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100/10 border border-amber-200/20">
            <Lock className="h-8 w-8 text-amber-500" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-800">
            {feature} Bloqueado
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
          
          <div className="bg-blue-50/50 border border-blue-200/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <UserCheck className="h-4 w-4" />
              <span className="font-medium text-sm">Próximo passo:</span>
            </div>
            <p className="text-blue-600 text-sm">
              Complete seu onboarding para liberar todas as funcionalidades do VIVER DE IA Club.
            </p>
          </div>

          <Button asChild className="w-full bg-viverblue hover:bg-viverblue/90">
            <Link to={redirectTo} className="flex items-center gap-2">
              {buttonText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
