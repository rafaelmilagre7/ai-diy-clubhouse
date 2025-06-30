
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMockOnboarding } from '../MockOnboardingWizardContainer';
import { WhatsAppInput } from '@/components/onboarding/components/WhatsAppInput';
import { BirthDateSelector } from '@/components/onboarding/components/BirthDateSelector';

export const MockOnboardingStep1 = () => {
  const { data, updateData, getFieldError } = useMockOnboarding();

  // Função para extrair componentes da data
  const extractDateComponents = (dateString: string) => {
    if (!dateString) return { day: '', month: '', year: '' };
    
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      
      return { day, month, year };
    } catch {
      return { day: '', month: '', year: '' };
    }
  };

  const { day: birthDay, month: birthMonth, year: birthYear } = extractDateComponents(data.birthDate || '');

  // Função para atualizar a data de nascimento
  const handleBirthDateChange = (day: string, month: string, year: string) => {
    if (day && month && year) {
      const birthDate = `${year}-${month}-${day}`;
      updateData({ birthDate });
    } else {
      updateData({ birthDate: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-[#0A0E1A]/90 backdrop-blur-sm border-white/10">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Informações Pessoais
            </CardTitle>
            <p className="text-slate-300">
              Vamos começar conhecendo você melhor
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-200">Nome Completo *</Label>
              <Input
                value={data.name || ''}
                onChange={(e) => updateData({ name: e.target.value })}
                className="bg-[#151823] border-white/20 text-white mt-1"
                placeholder="Seu nome completo"
              />
              {getFieldError('name') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('name')}</p>
              )}
            </div>

            <div>
              <Label className="text-slate-200">E-mail *</Label>
              <Input
                type="email"
                value={data.email || ''}
                onChange={(e) => updateData({ email: e.target.value })}
                className="bg-[#151823] border-white/20 text-white mt-1"
                placeholder="seu@email.com"
              />
              {getFieldError('email') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('email')}</p>
              )}
            </div>

            <WhatsAppInput
              value={data.phone || ''}
              onChange={(value) => updateData({ phone: value })}
              getFieldError={getFieldError}
            />

            <div>
              <Label className="text-slate-200">Instagram</Label>
              <Input
                value={data.instagram || ''}
                onChange={(e) => updateData({ instagram: e.target.value })}
                className="bg-[#151823] border-white/20 text-white mt-1"
                placeholder="@seuinstagram"
              />
            </div>

            <div>
              <Label className="text-slate-200">LinkedIn</Label>
              <Input
                value={data.linkedin || ''}
                onChange={(e) => updateData({ linkedin: e.target.value })}
                className="bg-[#151823] border-white/20 text-white mt-1"
                placeholder="https://linkedin.com/in/seuperfil"
              />
            </div>

            <BirthDateSelector
              birthDay={birthDay}
              birthMonth={birthMonth}
              birthYear={birthYear}
              onChange={handleBirthDateChange}
              getFieldError={getFieldError}
            />

            <div>
              <Label className="text-slate-200">Curiosidade sobre você</Label>
              <Textarea
                value={data.curiosity || ''}
                onChange={(e) => updateData({ curiosity: e.target.value })}
                className="bg-[#151823] border-white/20 text-white mt-1"
                placeholder="Conte algo interessante sobre você..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
