
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface MockOnboardingStep1Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  getFieldError?: (field: string) => string | undefined;
}

const MockOnboardingStep1: React.FC<MockOnboardingStep1Props> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    onUpdateData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1f2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            👋 Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nome Completo */}
          <div>
            <Label htmlFor="name" className="text-slate-200">
              Nome Completo *
            </Label>
            <Input
              id="name"
              value={data.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Digite seu nome completo"
              className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-gray-400"
            />
            {getFieldError?.('name') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('name')}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-slate-200">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="seu@email.com"
              className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-gray-400"
            />
            {getFieldError?.('email') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('email')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockOnboardingStep1;
