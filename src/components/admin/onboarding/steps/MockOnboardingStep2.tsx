
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';
import { LocationSelector } from '@/components/onboarding/components/LocationSelector';
import { BirthDateSelector } from '@/components/onboarding/components/BirthDateSelector';

interface MockOnboardingStep2Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  getFieldError?: (field: string) => string | undefined;
}

const MockOnboardingStep2: React.FC<MockOnboardingStep2Props> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    onUpdateData({ [field]: value });
  };

  const handleBirthDateChange = (day: string, month: string, year: string) => {
    const birthDate = day && month && year ? `${day}/${month}/${year}` : '';
    onUpdateData({ 
      birthDate,
      birthDay: day,
      birthMonth: month,
      birthYear: year
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1f2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            🏢 Perfil Empresarial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nome da Empresa */}
          <div>
            <Label htmlFor="companyName" className="text-slate-200">
              Nome da Empresa
            </Label>
            <Input
              id="companyName"
              value={data.companyName || ''}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Digite o nome da empresa"
              className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Website */}
          <div>
            <Label htmlFor="companyWebsite" className="text-slate-200">
              Website da Empresa
            </Label>
            <Input
              id="companyWebsite"
              value={data.companyWebsite || ''}
              onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
              placeholder="https://www.exemplo.com"
              className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Setor */}
          <div>
            <Label htmlFor="businessSector" className="text-slate-200">
              Setor de Atuação *
            </Label>
            <Select 
              value={data.businessSector || ''} 
              onValueChange={(value) => handleInputChange('businessSector', value)}
            >
              <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent className="bg-[#151823] border-white/20">
                <SelectItem value="tecnologia" className="text-white">Tecnologia</SelectItem>
                <SelectItem value="saude" className="text-white">Saúde</SelectItem>
                <SelectItem value="educacao" className="text-white">Educação</SelectItem>
                <SelectItem value="varejo" className="text-white">Varejo</SelectItem>
                <SelectItem value="servicos" className="text-white">Serviços</SelectItem>
                <SelectItem value="outros" className="text-white">Outros</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError?.('businessSector') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('businessSector')}</p>
            )}
          </div>

          {/* Tamanho da Empresa */}
          <div>
            <Label htmlFor="companySize" className="text-slate-200">
              Tamanho da Empresa
            </Label>
            <Select 
              value={data.companySize || ''} 
              onValueChange={(value) => handleInputChange('companySize', value)}
            >
              <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Selecione o tamanho" />
              </SelectTrigger>
              <SelectContent className="bg-[#151823] border-white/20">
                <SelectItem value="1-10" className="text-white">1-10 funcionários</SelectItem>
                <SelectItem value="11-50" className="text-white">11-50 funcionários</SelectItem>
                <SelectItem value="51-200" className="text-white">51-200 funcionários</SelectItem>
                <SelectItem value="201-500" className="text-white">201-500 funcionários</SelectItem>
                <SelectItem value="500+" className="text-white">Mais de 500 funcionários</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cargo */}
          <div>
            <Label htmlFor="position" className="text-slate-200">
              Cargo/Posição *
            </Label>
            <Input
              id="position"
              value={data.position || ''}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder="Ex: CEO, Gerente, Analista..."
              className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-gray-400"
            />
            {getFieldError?.('position') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('position')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockOnboardingStep2;
