
import React from 'react';
import { motion } from 'framer-motion';
import { Building, Calendar, MapPin, User, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BirthDateSelector } from '@/components/onboarding/components/BirthDateSelector';
import { LocationSelector } from '@/components/onboarding/components/LocationSelector';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface MockOnboardingStep2Props {
  data: OnboardingData;
  onUpdateData: (stepData: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  validationErrors?: Array<{ field: string; message: string }>;
  getFieldError?: (field: string) => string | undefined;
}

const MockOnboardingStep2 = ({ 
  data, 
  onUpdateData, 
  onNext, 
  onPrev,
  getFieldError 
}: MockOnboardingStep2Props) => {
  const handleInputChange = (field: string, value: string) => {
    onUpdateData({ [field]: value });
  };

  const handleLocationChange = (state: string, city: string) => {
    onUpdateData({ state, city });
  };

  const handleBirthDateChange = (day: string, month: string, year: string) => {
    onUpdateData({ 
      birthDay: day, 
      birthMonth: month, 
      birthYear: year,
      birthDate: day && month && year ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : undefined
    });
  };

  const revenueOptions = [
    { value: 'até-50k', label: 'Até R$ 50.000' },
    { value: '50k-100k', label: 'R$ 50.000 - R$ 100.000' },
    { value: '100k-250k', label: 'R$ 100.000 - R$ 250.000' },
    { value: '250k-500k', label: 'R$ 250.000 - R$ 500.000' },
    { value: '500k-1m', label: 'R$ 500.000 - R$ 1.000.000' },
    { value: '1m-2m', label: 'R$ 1.000.000 - R$ 2.000.000' },
    { value: '2m-5m', label: 'R$ 2.000.000 - R$ 5.000.000' },
    { value: '5m-10m', label: 'R$ 5.000.000 - R$ 10.000.000' },
    { value: '10m-25m', label: 'R$ 10.000.000 - R$ 25.000.000' },
    { value: '25m-50m', label: 'R$ 25.000.000 - R$ 50.000.000' },
    { value: '50m-100m', label: 'R$ 50.000.000 - R$ 100.000.000' },
    { value: 'acima-100m', label: 'Acima de R$ 100.000.000' }
  ];

  const positionOptions = [
    { value: 'ceo', label: 'CEO/Presidente' },
    { value: 'diretor', label: 'Diretor' },
    { value: 'gerente', label: 'Gerente' },
    { value: 'coordenador', label: 'Coordenador' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'analista-senior', label: 'Analista Sênior' },
    { value: 'analista-pleno', label: 'Analista Pleno' },
    { value: 'analista-junior', label: 'Analista Júnior' },
    { value: 'especialista', label: 'Especialista' },
    { value: 'consultor', label: 'Consultor' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'assistente', label: 'Assistente' },
    { value: 'estagiario', label: 'Estagiário' },
    { value: 'proprietario', label: 'Proprietário' },
    { value: 'socio', label: 'Sócio' },
    { value: 'empreendedor', label: 'Empreendedor' },
    { value: 'freelancer', label: 'Freelancer/Autônomo' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-viverblue/20 flex items-center justify-center mx-auto">
          <Building className="w-8 h-8 text-viverblue" />
        </div>
        <h2 className="text-3xl font-heading font-bold text-white">
          Perfil Empresarial
        </h2>
        <p className="text-neutral-300 text-lg">
          Conte-nos mais sobre sua empresa e posição profissional
        </p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-neutral-200 flex items-center gap-2">
            <Building className="w-4 h-4" />
            Nome da Empresa *
          </Label>
          <Input
            id="companyName"
            value={data.companyName || ''}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            placeholder="Ex: Viver de IA"
            className="bg-[#151823] border-white/10 text-white placeholder:text-neutral-500"
          />
          {getFieldError?.('companyName') && (
            <p className="text-red-400 text-sm">{getFieldError('companyName')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyWebsite" className="text-neutral-200">
            Site da Empresa
          </Label>
          <Input
            id="companyWebsite"
            value={data.companyWebsite || ''}
            onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
            placeholder="https://www.suaempresa.com.br"
            className="bg-[#151823] border-white/10 text-white placeholder:text-neutral-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessSector" className="text-neutral-200">
            Setor de Atuação *
          </Label>
          <Input
            id="businessSector"
            value={data.businessSector || ''}
            onChange={(e) => handleInputChange('businessSector', e.target.value)}
            placeholder="Ex: Tecnologia, Consultoria, E-commerce"
            className="bg-[#151823] border-white/10 text-white placeholder:text-neutral-500"
          />
          {getFieldError?.('businessSector') && (
            <p className="text-red-400 text-sm">{getFieldError('businessSector')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companySize" className="text-neutral-200 flex items-center gap-2">
            <User className="w-4 h-4" />
            Tamanho da Empresa *
          </Label>
          <Select value={data.companySize || ''} onValueChange={(value) => handleInputChange('companySize', value)}>
            <SelectTrigger className="bg-[#151823] border-white/10 text-white">
              <SelectValue placeholder="Selecione o tamanho da empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 funcionários</SelectItem>
              <SelectItem value="11-50">11-50 funcionários</SelectItem>
              <SelectItem value="51-200">51-200 funcionários</SelectItem>
              <SelectItem value="201-500">201-500 funcionários</SelectItem>
              <SelectItem value="501-1000">501-1000 funcionários</SelectItem>
              <SelectItem value="1000+">Mais de 1000 funcionários</SelectItem>
            </SelectContent>
          </Select>
          {getFieldError?.('companySize') && (
            <p className="text-red-400 text-sm">{getFieldError('companySize')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="annualRevenue" className="text-neutral-200">
            Faturamento Anual *
          </Label>
          <Select value={data.annualRevenue || ''} onValueChange={(value) => handleInputChange('annualRevenue', value)}>
            <SelectTrigger className="bg-[#151823] border-white/10 text-white">
              <SelectValue placeholder="Selecione o faturamento anual" />
            </SelectTrigger>
            <SelectContent>
              {revenueOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getFieldError?.('annualRevenue') && (
            <p className="text-red-400 text-sm">{getFieldError('annualRevenue')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="position" className="text-neutral-200 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Cargo/Função *
          </Label>
          <Select value={data.position || ''} onValueChange={(value) => handleInputChange('position', value)}>
            <SelectTrigger className="bg-[#151823] border-white/10 text-white">
              <SelectValue placeholder="Selecione seu cargo/função" />
            </SelectTrigger>
            <SelectContent>
              {positionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getFieldError?.('position') && (
            <p className="text-red-400 text-sm">{getFieldError('position')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-neutral-200 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Localização
          </Label>
          <LocationSelector
            selectedState={data.state || ''}
            selectedCity={data.city || ''}
            onLocationChange={handleLocationChange}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-neutral-200 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Data de Nascimento
          </Label>
          <BirthDateSelector
            selectedDay={data.birthDay || ''}
            selectedMonth={data.birthMonth || ''}
            selectedYear={data.birthYear || ''}
            onBirthDateChange={handleBirthDateChange}
          />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrev}
          className="bg-transparent border-white/20 text-white hover:bg-white/10"
        >
          Voltar
        </Button>
        <Button 
          onClick={onNext}
          className="bg-viverblue hover:bg-viverblue/90 text-white"
        >
          Continuar
        </Button>
      </div>
    </motion.div>
  );
};

export default MockOnboardingStep2;
