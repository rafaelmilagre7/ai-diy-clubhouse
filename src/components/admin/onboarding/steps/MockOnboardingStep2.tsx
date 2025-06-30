
import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Briefcase, Calendar, DollarSign, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BirthDateSelector } from '@/components/onboarding/components/BirthDateSelector';
import { OnboardingStepProps } from '../types/onboardingTypes';

const MockOnboardingStep2: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  const handleBirthDateChange = (day: string, month: string, year: string) => {
    const birthDate = day && month && year ? `${day}/${month}/${year}` : '';
    onUpdateData({ 
      birthDate,
      birthDay: day,
      birthMonth: month,
      birthYear: year
    });
  };

  const jobPositions = [
    'CEO / Fundador',
    'Diretor',
    'Gerente',
    'Coordenador',
    'Supervisor',
    'Analista',
    'Assistente',
    'Consultor',
    'Especialista',
    'Engenheiro',
    'Desenvolvedor',
    'Designer',
    'Vendedor',
    'Marketing',
    'Recursos Humanos',
    'Empresário',
    'Freelancer'
  ];

  const businessSectors = [
    'Tecnologia',
    'Varejo',
    'Serviços',
    'Indústria',
    'Saúde',
    'Educação',
    'Financeiro',
    'Imobiliário',
    'Alimentação',
    'Beleza',
    'Moda',
    'Consultoria',
    'Agronegócio',
    'Outros'
  ];

  const revenueRanges = [
    'Até R$ 10.000',
    'R$ 10.001 - R$ 50.000',
    'R$ 50.001 - R$ 100.000',
    'R$ 100.001 - R$ 250.000',
    'R$ 250.001 - R$ 500.000',
    'R$ 500.001 - R$ 1.000.000',
    'R$ 1.000.001 - R$ 2.500.000',
    'R$ 2.500.001 - R$ 5.000.000',
    'R$ 5.000.001 - R$ 10.000.000',
    'R$ 10.000.001 - R$ 25.000.000',
    'R$ 25.000.001 - R$ 50.000.000',
    'Acima de R$ 50.000.000'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Briefcase className="w-8 h-8 text-viverblue" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Informações Profissionais
        </h2>
        <p className="text-slate-400">
          Nos conte sobre seu trabalho e negócio
        </p>
      </div>

      <div className="space-y-6">
        {/* Empresa */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div>
            <Label htmlFor="companyName" className="text-slate-200">
              Nome da Empresa *
            </Label>
            <div className="relative mt-1">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="companyName"
                value={data.companyName || ''}
                onChange={(e) => onUpdateData({ companyName: e.target.value })}
                className="pl-10 bg-[#151823] border-white/20 text-white"
                placeholder="Nome da sua empresa"
              />
            </div>
            {getFieldError?.('companyName') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('companyName')}</p>
            )}
          </div>
        </Card>

        {/* Cargo e Setor */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position" className="text-slate-200">
                Cargo/Função *
              </Label>
              <div className="relative mt-1">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
                <Select value={data.position || ''} onValueChange={(value) => onUpdateData({ position: value })}>
                  <SelectTrigger className="pl-10 bg-[#151823] border-white/20 text-white">
                    <SelectValue placeholder="Selecione seu cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobPositions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {getFieldError?.('position') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('position')}</p>
              )}
            </div>

            <div>
              <Label htmlFor="businessSector" className="text-slate-200">
                Setor do Negócio *
              </Label>
              <div className="relative mt-1">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
                <Select value={data.businessSector || ''} onValueChange={(value) => onUpdateData({ businessSector: value })}>
                  <SelectTrigger className="pl-10 bg-[#151823] border-white/20 text-white">
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessSectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {getFieldError?.('businessSector') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('businessSector')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Data de Nascimento - MANTENDO O FORMATO ORIGINAL */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Data de Nascimento</h3>
          <BirthDateSelector
            birthDay={data.birthDay}
            birthMonth={data.birthMonth}
            birthYear={data.birthYear}
            onChange={handleBirthDateChange}
            getFieldError={getFieldError}
          />
        </Card>

        {/* Faturamento Anual */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div>
            <Label className="text-slate-200 flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4" />
              Faturamento Anual da Empresa
            </Label>
            <RadioGroup 
              value={data.annualRevenue || ''} 
              onValueChange={(value) => onUpdateData({ annualRevenue: value })}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {revenueRanges.map((range) => (
                <div key={range} className="flex items-center space-x-2">
                  <RadioGroupItem value={range} id={range} />
                  <Label htmlFor={range} className="text-slate-300 text-sm cursor-pointer">
                    {range}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default MockOnboardingStep2;
