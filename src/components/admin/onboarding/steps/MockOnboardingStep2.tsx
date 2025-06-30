
import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, DollarSign, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface MockOnboardingStep2Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  getFieldError?: (field: string) => string | undefined;
}

const businessSectors = [
  'Tecnologia',
  'E-commerce',
  'Educação',
  'Saúde',
  'Consultoria',
  'Marketing e Publicidade',
  'Varejo',
  'Serviços Financeiros',
  'Imobiliário',
  'Alimentação',
  'Indústria',
  'Agricultura',
  'Construção',
  'Turismo',
  'Transporte e Logística',
  'Outros'
];

const companySizes = [
  'Apenas eu (pessoa física)',
  '2-5 funcionários',
  '6-10 funcionários',
  '11-20 funcionários',
  '21-50 funcionários',
  '51-100 funcionários',
  '101-500 funcionários',
  'Mais de 500 funcionários'
];

const annualRevenues = [
  'Até R$ 50.000',
  'R$ 50.001 - R$ 100.000',
  'R$ 100.001 - R$ 250.000',
  'R$ 250.001 - R$ 500.000',
  'R$ 500.001 - R$ 1 milhão',
  'R$ 1 - R$ 2 milhões',
  'R$ 2 - R$ 5 milhões',
  'R$ 5 - R$ 10 milhões',
  'R$ 10 - R$ 20 milhões',
  'R$ 20 - R$ 50 milhões',
  'R$ 50 - R$ 100 milhões',
  'Acima de R$ 100 milhões'
];

const MockOnboardingStep2: React.FC<MockOnboardingStep2Props> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
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
          <Building2 className="w-8 h-8 text-viverblue" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Perfil Empresarial
        </h2>
        <p className="text-slate-400">
          Agora vamos conhecer sua empresa e negócio
        </p>
      </div>

      <div className="space-y-6">
        {/* Informações da Empresa */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div>
              <Label htmlFor="companyName" className="text-slate-200">
                Nome da Empresa/Negócio *
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

            <div>
              <Label htmlFor="companyWebsite" className="text-slate-200">
                Website da Empresa
              </Label>
              <Input
                id="companyWebsite"
                value={data.companyWebsite || ''}
                onChange={(e) => onUpdateData({ companyWebsite: e.target.value })}
                className="mt-1 bg-[#151823] border-white/20 text-white"
                placeholder="https://suaempresa.com"
              />
            </div>

            <div>
              <Label htmlFor="businessSector" className="text-slate-200">
                Setor de Atuação *
              </Label>
              <Select 
                value={data.businessSector || ''} 
                onValueChange={(value) => onUpdateData({ businessSector: value })}
              >
                <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  {businessSectors.map((sector) => (
                    <SelectItem key={sector} value={sector} className="text-white hover:bg-white/10">
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('businessSector') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('businessSector')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Porte da Empresa */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Porte da Empresa</h3>
            </div>

            <div>
              <Label htmlFor="companySize" className="text-slate-200">
                Tamanho da Equipe *
              </Label>
              <Select 
                value={data.companySize || ''} 
                onValueChange={(value) => onUpdateData({ companySize: value })}
              >
                <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione o tamanho da equipe" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  {companySizes.map((size) => (
                    <SelectItem key={size} value={size} className="text-white hover:bg-white/10">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('companySize') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('companySize')}</p>
              )}
            </div>

            <div>
              <Label htmlFor="annualRevenue" className="text-slate-200">
                Faturamento Anual *
              </Label>
              <Select 
                value={data.annualRevenue || ''} 
                onValueChange={(value) => onUpdateData({ annualRevenue: value })}
              >
                <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione a faixa de faturamento" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  {annualRevenues.map((revenue) => (
                    <SelectItem key={revenue} value={revenue} className="text-white hover:bg-white/10">
                      {revenue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('annualRevenue') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('annualRevenue')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Posição */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Sua Posição</h3>
            </div>

            <div>
              <Label htmlFor="position" className="text-slate-200">
                Cargo/Função *
              </Label>
              <Input
                id="position"
                value={data.position || ''}
                onChange={(e) => onUpdateData({ position: e.target.value })}
                className="mt-1 bg-[#151823] border-white/20 text-white"
                placeholder="Ex: CEO, Diretor, Gerente, Coordenador..."
              />
              {getFieldError?.('position') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('position')}</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default MockOnboardingStep2;
